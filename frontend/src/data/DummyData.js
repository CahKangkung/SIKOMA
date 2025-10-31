// src/data/dummyData.js

export const users = [
  { id: 1, name: "Andi", email: "andi@gmail.com", password: "123456" },
  { id: 2, name: "Rafi", email: "rafi@gmail.com", password: "123456" },
  { id: 3, name: "Lina", email: "lina@gmail.com", password: "123456" },
  { id: 4, name: "Budiman", email: "budiman@gmail.com", password: "123456" },
  { id: 5, name: "Tono", email: "tono@gmail.com", password: "123456" },
  { id: 5, name: "Dina", email: "dina@gmail.com", password: "123456" },
];

export const organizations = [
  {
    id: 1,
    name: "PERSATUAN BOLA BASKET",
    authorId: 4,
    authorName: "Budiman",
    members: [4],
  },
  {
    id: 2,
    name: "ORGANISASI DESAIN GRAFIS",
    authorId: 5,
    authorName: "Tono",
    members: [5],
  },
  {
    id: 3,
    name: "KELOMPOK KELINCI PERCOBAAN",
    authorId: 3,
    authorName: "Lina",
    members: [3],
  },
  {
    id: 4,
    name: "HIMPUNAN PECINTA KOPI",
    authorId: 2,
    authorName: "Rafi",
    members: [2],
  },
  {
    id: 5,
    name: "KLUB PROGRAMMER MUDA",
    authorId: 1,
    authorName: "Andi",
    members: [1],
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
