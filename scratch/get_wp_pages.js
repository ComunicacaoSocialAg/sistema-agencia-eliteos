async function fetchPage(slug) {
  const url = `https://comunicacaosocialag.com.br/wp-json/wp/v2/pages?slug=${slug}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.length > 0) {
      console.log(`=== PAGE: ${slug} ===`);
      console.log('ID:', data[0].id);
      console.log('Title:', data[0].title.rendered);
      console.log('HTML Content:');
      console.log(data[0].content.rendered);
    } else {
      console.log(`Page ${slug} not found`);
    }
  } catch (err) {
    console.error('Error fetching page:', err);
  }
}

fetchPage('home-2');
