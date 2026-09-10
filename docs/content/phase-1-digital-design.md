---
phase: Phase 1
date: 2026-09-10
tags: digital-design, nand2tetris
---
# Digital Design

Nguồn: Nand2Tetris (official course).

### Boolean algebra; AND / OR / NOT; NAND / NOR; XOR / XNOR
Đại số Boolean là hệ thống đại số thao tác trên tập giá trị nhị phân chỉ gồm 2 mức logic: 0 (False / Low / mức điện áp thấp) và 1 (True / High / mức điện áp cao).
## Các định luật then chốt cần nắm:

- **Giao hoán & Kết hợp:** Tương tự số học thông thường
  \[
  A \cdot B = B \cdot A
  \]
  \[
  A + B = B + A
  \]

- **Phân phối (Distributive Law):**
  - Phép thông thường:
    \[
    A \cdot (B + C) = A \cdot B + A \cdot C
    \]
  - **Điểm khác lạ so với đại số thông thường:**
    \[
    A + (B \cdot C) = (A + B) \cdot (A + C)
    \]

- **Phần bù (Complement):**
  \[
  A \cdot \overline{A} = 0
  \]
  \[
  A + \overline{A} = 1
  \]

- **Tính lũy thừa (Idempotent):**
  \[
  A \cdot A = A
  \]
  \[
  A + A = A
  \]

Các cổng logic cơ bản và cách kết hợp chúng để biểu diễn mọi hàm boolean. NAND và NOR là 2 cổng vạn năng, chỉ cần 1 loại là tạo ra được tất cả cổng còn lại.
Cổng NOT: 
 $Q = \overline{A}$ hoặc $Q = A'$
 Bảng chân trị: 


![Bảng chân trị các cổng logic cơ bản](images/basic-gates.png)

### De Morgan; truth table; SOP / POS; minterm / maxterm
Định lý De Morgan giúp chuyển đổi giữa các biểu diễn AND/OR/NOT tương đương. SOP (Sum of Products) và POS (Product of Sums) là 2 cách chuẩn hóa biểu thức boolean từ bảng chân trị.

### K-map 2, 3, 4 biến
Karnaugh map — công cụ trực quan để rút gọn biểu thức boolean bằng cách nhóm các ô kề nhau trong bảng.

![Ví dụ rút gọn K-map 4 biến](images/kmap-4var.png)

### Half/Full Adder; Half/Full Subtractor; Ripple Carry Adder
Adder là mạch cộng nhị phân cơ bản nhất. Ripple Carry Adder nối nhiều Full Adder liên tiếp, carry lan truyền tuần tự qua từng bit.

### Comparator; MUX; DEMUX; Encoder; Decoder
Các mạch tổ hợp dùng để so sánh, chọn/phân luồng dữ liệu, và mã hóa/giải mã giữa các dạng biểu diễn khác nhau.

### Latch; D/JK/T Flip-Flop; Register; Shift Register
Các phần tử nhớ 1-bit (flip-flop) là nền tảng để xây dựng register lưu nhiều bit, và shift register dịch bit theo từng chu kỳ clock.

### Synchronous / Asynchronous Counter; Mod-N Counter; FSM
Counter đồng bộ dùng chung 1 clock cho mọi flip-flop, counter bất đồng bộ thì clock lan truyền qua từng tầng. FSM (Finite State Machine) mô hình hóa hệ thống bằng các trạng thái và điều kiện chuyển trạng thái.

![Sơ đồ trạng thái FSM mẫu](images/fsm-example.png)

### Nand2Tetris — Project 1: Boolean Logic
Tự dựng các cổng logic từ NAND — bài đầu tiên trong chuỗi Nand2Tetris.

### Nand2Tetris — Project 2: Boolean Arithmetic
Xây ALU và các mạch số học cơ bản từ những cổng logic đã dựng ở Project 1.

### Nand2Tetris — Project 3: Memory
Xây register và RAM từ flip-flop, hoàn thiện phần "bộ nhớ" của máy tính tự chế.

## Output
- Tự thiết kế ALU 4-bit trên giấy
- Tự thiết kế counter và FSM
- Upload HDL/code lên GitHub
