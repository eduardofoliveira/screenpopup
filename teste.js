lista = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

lista.map((item, index) => {
  if (index !== 0 && index % 4 === 0) {
    console.log(`</div>`);
  }
  if (index % 4 === 0) {
    console.log(`<div class="four fields">`);
  }
  console.log(`  <div class="field">
    <label>${item}</label>
    <div class="ui black message">${item}</div>
  </div>`);
  if (index !== 0 && index === lista.length - 1) {
    console.log(`</div>`);
  }
});
