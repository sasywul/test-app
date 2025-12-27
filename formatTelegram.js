function formatNilaiTelegram(nim, data) {
  let msg = `🎓 *Daftar Nilai SIMA*\n`;
  msg += `👤 *NIM:* ${nim}\n`;
  msg += `📊 *IPK:* *${data.ipk}*\n`;
  msg += `📚 Total MK: ${data.total_mk}\n\n`;

  for (const n of data.nilai) {
    msg += `• *${n.kode}* (${n.sks} SKS)\n`;
    msg += `  ${n.nama}\n`;
    msg += `  Nilai: *${n.nilai}*\n\n`;
  }

  return msg;
}

module.exports = { formatNilaiTelegram };
