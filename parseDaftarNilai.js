const cheerio = require("cheerio");

function parseDaftarNilai(html) {
  const $ = cheerio.load(html);

  const nilai = [];

  $("table tbody tr").each((_, el) => {
    const tds = $(el).find("td");
    if (tds.length < 6) return;

    const namaCell = $(tds[2]).text().trim();
    if (!namaCell || namaCell === "Total") return;

    nilai.push({
      semester: $(tds[1]).text().trim(),
      kode: $(tds[2]).find("b").text().trim(),
      nama: namaCell.replace($(tds[2]).find("b").text(), "").trim(),
      sks: $(tds[3]).text().trim(),
      nilai: $(tds[4]).text().trim() || "-"
    });
  });

  // 🔥 AMBIL IPK YANG BENAR
  let ipk = "-";
  $("table tbody tr").each((_, el) => {
    const tds = $(el).find("td");
    if ($(tds[0]).text().trim() === "IPK") {
      ipk = $(tds[tds.length - 1]).text().trim();
    }
  });

  return {
    ipk,
    total_mk: nilai.length,
    nilai
  };
}

module.exports = { parseDaftarNilai };
