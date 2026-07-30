async function fetchHome() {
  const url = `https://comunicacaosocialag.com.br/wp-json/wp/v2/pages/28`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.content) {
      import('fs').then(fs => {
        fs.writeFileSync('scratch/home_content.html', data.content.rendered);
        console.log('Homepage HTML saved to scratch/home_content.html');
      });
    } else {
      console.log('Error: Page 28 not found');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
fetchHome();
