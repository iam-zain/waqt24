package app.waqt24;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Home-screen widget: the next prayer and a live countdown.
 * The web app saves the upcoming prayer times with @capacitor/preferences under the key "waqt24_widget":
 * { "city": "Delhi", "fmt": "12" | "24", "items": [ { "n": "Asr", "t": epochMillis }, ... ] }
 * The countdown is a Chronometer, so it ticks by itself; an alarm refreshes the widget when each prayer arrives.
 */
public class NextPrayerWidget extends AppWidgetProvider {
    static final String ACT = "app.waqt24.WIDGET_TICK";

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) draw(c, m, id);
        scheduleNext(c);
    }

    @Override
    public void onReceive(Context c, Intent i) {
        super.onReceive(c, i);
        if (i != null && ACT.equals(i.getAction())) {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, NextPrayerWidget.class));
            onUpdate(c, m, ids);
        }
    }

    private static JSONObject load(Context c) {
        try {
            SharedPreferences sp = c.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String s = sp.getString("waqt24_widget", null);
            return s == null ? null : new JSONObject(s);
        } catch (Exception e) {
            return null;
        }
    }

    /** the first saved prayer that is still in the future, or null */
    private static JSONObject next(JSONObject data, long now) {
        try {
            JSONArray a = data.getJSONArray("items");
            for (int k = 0; k < a.length(); k++) {
                JSONObject o = a.getJSONObject(k);
                if (o.getLong("t") > now) return o;
            }
        } catch (Exception e) { }
        return null;
    }

    static void draw(Context c, AppWidgetManager m, int id) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.waqt24_widget);
        long now = System.currentTimeMillis();
        JSONObject data = load(c);
        JSONObject nx = data == null ? null : next(data, now);
        if (nx == null) {
            v.setTextViewText(R.id.wd_name, "Waqt24");
            v.setViewVisibility(R.id.wd_chrono, View.GONE);
            v.setTextViewText(R.id.wd_sub, "Auqaat ke liye app kholein");
        } else {
            try {
                long t = nx.getLong("t");
                boolean h12 = !"24".equals(data.optString("fmt", "24"));
                String time = new SimpleDateFormat(h12 ? "h:mm a" : "HH:mm", Locale.getDefault()).format(new Date(t));
                String city = data.optString("city", "");
                v.setTextViewText(R.id.wd_name, nx.getString("n"));
                v.setTextViewText(R.id.wd_sub, time + (city.isEmpty() ? "" : "  ·  " + city));
                v.setViewVisibility(R.id.wd_chrono, View.VISIBLE);
                v.setChronometerCountDown(R.id.wd_chrono, true);
                v.setChronometer(R.id.wd_chrono, SystemClock.elapsedRealtime() + (t - now), null, true);
            } catch (Exception e) {
                v.setTextViewText(R.id.wd_name, "Waqt24");
                v.setViewVisibility(R.id.wd_chrono, View.GONE);
            }
        }
        Intent launch = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        if (launch != null) {
            PendingIntent pi = PendingIntent.getActivity(c, 0, launch, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            v.setOnClickPendingIntent(R.id.wd_root, pi);
        }
        m.updateAppWidget(id, v);
    }

    /** wake the widget up just after the next prayer starts, so it switches to the one after */
    static void scheduleNext(Context c) {
        try {
            JSONObject data = load(c);
            JSONObject nx = data == null ? null : next(data, System.currentTimeMillis());
            if (nx == null) return;
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            Intent i = new Intent(c, NextPrayerWidget.class).setAction(ACT);
            PendingIntent pi = PendingIntent.getBroadcast(c, 1, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            am.set(AlarmManager.RTC, nx.getLong("t") + 2000, pi);
        } catch (Exception e) { }
    }
}
