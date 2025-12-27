const { fetchDaftarNilaiWithLogin } = require("./simaClient");

(async () => {
  const html = await fetchDaftarNilaiWithLogin(
    "G.111.24.0021",
    "152123Aa"
  );

  console.log(html.length);
})();
