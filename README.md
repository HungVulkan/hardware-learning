# hardware-learning
This repository documents my structured engineering journey covering **Digital Logic Design**, **Verilog/SystemVerilog RTL**, **FPGA Prototyping**, **Computer Architecture (RISC-V)**, and **Embedded Systems (ARM Cortex-M & FreeRTOS)**.

It contains source RTL codes, self-checking testbenches, simulation waveforms, architecture block diagrams, and hardware deployment demonstrations.

**Objectives**
- Build a solid, industry-relevant foundation in front-end ASIC/FPGA digital design and verification.
- Write synthesizable RTL code, eliminate latch inferences, and implement robust finite state machines (FSMs).
- Develop self-checking testbenches, debug waveforms, and verify designs on real FPGA silicon.
- Design a single-cycle/pipelined **RISC-V (RV32I) CPU core**, integrate standard on-chip bus interconnects (APB / AXI4-Lite), and build multi-tasking bare-metal/RTOS firmware on ARM Cortex-M microcontrollers.
## 📂 Repository Structure

```text
├── 📁 digital-design/         # Combinational/sequential logic analysis, ALU, FSM (Nand2Tetris)
├── 📁 verilog/                # Synthesizable RTL designs, practice modules (HDLBits)
├── 📁 systemverilog/          # Interfaces, packages, assertions (SVA), verification testbenches
├── 📁 testbench/              # Self-checking testbenches & simulation waveforms (.vcd, .gtkw)
├── 📁 fpga/                   # Constraints (XDC/CST), synthesis reports, hardware deployment demos
├── 📁 computer-architecture/  # CPU datapaths, control logic, RV32I ISA documentation
├── 📁 embedded/               # Bare-metal C drivers, CMSIS-DSP, and FreeRTOS applications
└── 📁 docs/                   # Waveforms, architectural diagrams, reports, and certificates
