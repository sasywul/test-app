const cheerio = require("cheerio");

module.exports = function parseDaftarNilai(html) {
  const $ = cheerio.load(html);

  // 🔹 Ambil nama mahasiswa
  const nama = $(".text-orange.font-bold.text-u-c").first().text().trim() || null;

  const data = [];
  let ipk = null;

  $("table tbody tr").each((_, el) => {
    const tds = $(el).find("td");

    // 🔹 Baris IPK
    if (tds.length === 2 && $(tds[0]).text().includes("IPK")) {
      ipk = $(tds[1]).text().trim();
      return;
    }

    if (tds.length < 6) return;

    const matkulText = $(tds[2]).text().replace(/\s+/g, " ").trim();
    const kodeMatch = matkulText.match(/^([A-Z0-9]+)\s+(.*)$/);

    data.push({
      semester: $(tds[1]).text().trim(),
      kode: kodeMatch ? kodeMatch[1] : null,
      matkul: kodeMatch ? kodeMatch[2] : matkulText,
      sks: Number($(tds[3]).text().trim()) || null,
      nilai: $(tds[4]).text().trim() || null,
      mutu: Number($(tds[5]).text().trim()) || null
    });
  });

  return {
    nama,
    ipk: ipk ? Number(ipk) : null,
    total_makul: data.length,
    data
  };
};
