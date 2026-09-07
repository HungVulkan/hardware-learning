// Mỗi phase là 1 entry. Thêm entry mới ở CUỐI mảng khi bạn hoàn thành/bắt đầu 1 phase.
// done: true  -> node xanh (đã xong) | false -> node xám (đang làm / chưa làm)
const POSTS = [
  {
    id: "phase-0",
    date: "2026-09-06",
    phase: "Phase 0",
    done: true,
    tags: ["setup", "github"],
    title: {
      vi: "Setup repo và cấu trúc thư mục",
      en: "Repo setup and folder structure"
    },
    body: {
      vi: [
        "Tạo GitHub repo cá nhân `hardware-learning` để lưu toàn bộ quá trình tự học.",
        "Chia thư mục theo mảng kiến thức: digital-design (verilog / systemverilog / testbench), fpga, computer-architecture, embedded.",
        "Viết README.md kèm bảng tracking tiến độ theo từng phase để dễ theo dõi."
      ],
      en: [
        "Created a personal GitHub repo `hardware-learning` to track the whole self-study process.",
        "Split folders by knowledge area: digital-design (verilog / systemverilog / testbench), fpga, computer-architecture, embedded.",
        "Wrote a README.md with a phase-by-phase progress table for easy tracking."
      ]
    }
  }
];
