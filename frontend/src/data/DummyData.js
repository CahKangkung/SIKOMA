// src/data/DummyData.js
export const users = [
  { id: 1, name: "Andi", email: "andi@gmail.com", password: "123456" },
  { id: 2, name: "Rafi", email: "rafi@gmail.com", password: "123456" },
  { id: 3, name: "Lina", email: "lina@gmail.com", password: "123456" },
  { id: 4, name: "Budiman", email: "budiman@gmail.com", password: "123456" },
  { id: 5, name: "Tono", email: "tono@gmail.com", password: "123456" },
  { id: 6, name: "Dina", email: "dina@gmail.com", password: "123456" },
];

export const organizations = [
  {
    id: 1,
    name: "PERSATUAN BOLA BASKET",
    authorId: 4,
    authorName: "Budiman",
    members: [4],
    description:
      "PERSATUAN BOLA BASKET adalah organisasi mahasiswa yang berfokus pada pengembangan kemampuan dan prestasi dalam bidang olahraga bola basket. Kami rutin mengadakan latihan, kompetisi internal, dan turnamen antar universitas. Tujuan utama kami adalah membangun semangat sportivitas, kekompakan tim, serta gaya hidup sehat melalui olahraga.",
  },
  {
    id: 2,
    name: "ORGANISASI DESAIN GRAFIS",
    authorId: 5,
    authorName: "Tono",
    members: [5],
    description:
      "ORGANISASI DESAIN GRAFIS merupakan wadah bagi mahasiswa yang memiliki minat di dunia desain digital. Kami mengadakan workshop desain, pelatihan software kreatif, dan kolaborasi proyek visual. Visi kami adalah menciptakan desainer muda yang inovatif, profesional, dan siap bersaing di dunia industri kreatif.",
  },
  {
    id: 3,
    name: "KELOMPOK KELINCI PERCOBAAN",
    authorId: 3,
    authorName: "Lina",
    members: [3],
    description:
      "KELOMPOK KELINCI PERCOBAAN adalah organisasi yang fokus pada kegiatan penelitian dan eksperimen ilmiah di bidang biologi dan kimia. Kami bertujuan mengasah keterampilan riset mahasiswa serta meningkatkan minat terhadap sains melalui kegiatan laboratorium, seminar, dan proyek ilmiah.",
  },
  {
    id: 4,
    name: "HIMPUNAN PECINTA KOPI",
    authorId: 2,
    authorName: "Rafi",
    members: [2],
    description:
      "HIMPUNAN PECINTA KOPI adalah komunitas yang menyatukan para penikmat kopi dari berbagai latar belakang. Kami mengadakan acara cupping, sharing session, hingga perjalanan wisata ke kebun kopi lokal. Tujuan kami adalah memperdalam wawasan tentang kopi sekaligus mempererat persahabatan antar pecinta kopi.",
  },
  {
    id: 5,
    name: "KLUB PROGRAMMER MUDA",
    authorId: 1,
    authorName: "Andi",
    members: [1],
    description:
      "KLUB PROGRAMMER MUDA adalah komunitas mahasiswa pecinta teknologi yang fokus pada pengembangan keterampilan di bidang pemrograman dan software development. Kami belajar bersama tentang web, mobile, dan AI. Visi kami adalah mencetak generasi muda yang melek teknologi dan siap bersaing di dunia digital.",
  },
];

export const joinRequests = [
  {
    requestId: 1001,
    orgId: 1,
    orgName: "PERSATUAN BOLA BASKET",
    userId: 3,
    userName: "Lina",
    status: "pending",
    requestedAt: "2025-10-30 10:00:00",
  },
  {
    requestId: 1002,
    orgId: 2,
    orgName: "ORGANISASI DESAIN GRAFIS",
    userId: 1,
    userName: "Andi",
    status: "pending",
    requestedAt: "2025-10-30 10:10:00",
  },
];

export const userCurrentOrganizations = [
  {
    userId: 1,
    organizations: [
      {
        id: 5,
        name: "KLUB PROGRAMMER MUDA",
        authorName: "Andi",
        status: "active",
      },
      {
        id: 2,
        name: "ORGANISASI DESAIN GRAFIS",
        authorName: "Tono",
        status: "pending",
      },
    ],
  },
];
