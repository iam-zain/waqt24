/* QUIZ from the Anbiya duas: show the dua and ask which prophet made it, and in which situation. Built from DUAS, so new Anbiya duas join the quiz automatically. */
(function generateAnbiyaDuaQuiz(){
  const list = DUAS.filter(d=> d.cat === 'Anbiya (Mushkil Waqt)' && /: /.test(d.title)).map(d=>{
    const i = d.title.indexOf(': ');
    return { d, who:d.title.slice(0, i).replace('(AS)', 'AS'), when:d.title.slice(i + 2) };
  });
  if(list.length < 4) return;
  const CAT = 'Anbiya ki Duain';
  QUIZ_CATEGORIES.push(CAT); QUIZ_CAT_ICON[CAT] = '🌟';
  const body = (head, d)=> `${head}\n\n${d.translit}\n\n${d.arabic}\n\nHawala: ${d.ref}`;
  const mk = (head, x, key)=>{
    const wrong = shuffleArr(list.filter(y=> y[key] !== x[key])).slice(0, 3).map(y=> y[key]);
    const opts = shuffleArr([x[key], ...wrong]);
    QUIZ_BANK.push([body(head, x.d), opts, opts.indexOf(x[key]), CAT]);
  };
  /* "Ye dua kis Nabi ki hai?" (the Hasbunallah verse is left out: it is also reported from Hazrat Ibrahim AS in the fire) */
  list.filter(x=> !/Muhammad/.test(x.who)).forEach(x=> mk('Ye dua kis Nabi ki hai?', x, 'who'));
  /* "Ye dua kis halat mein ki?" */
  list.forEach(x=> mk(`${x.who} ne ye dua kis halat mein ki?`, x, 'when'));
})();
