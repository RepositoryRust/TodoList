export const PASSWORD_RULES = [
  {
    label: "Panjang 8–20 karakter",
    test: (pw: string) => pw.length >= 8 && pw.length <= 20,
  },
  {
    label: "Mengandung huruf besar (A–Z) dan kecil (a–z)",
    test: (pw: string) => /[A-Z]/.test(pw) && /[a-z]/.test(pw),
  },
  {
    label: "Mengandung minimal 1 angka atau simbol",
    test: (pw: string) => /[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw),
  },
];