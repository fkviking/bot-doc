---
title: 13. Client server requirements
section: 13
ignore-section-number: true
---


# Hardware requirements

*   **Processor:** At least 8 cores with hyperthreading disabled.
    *   *Note:* On exchanges such as MOEX or SPBEX, where separate bots are used for UDP streams, additional cores are required for additional streams.
*   **Virtualization:** If using a virtual machine, it must support core isolation (pinning)
*   **RAM:** At least 8 GB, at a rate of 1 GB per core (more cores = more memory).
*   **Drive:** HDD or SSD with at least 40 GB of storage.
*   **Network subsystem:** In accordance with MOEX requirements, connections providing access to high-speed exchange data services are provided by two physical links at 10 Gbps speeds using the 10GBaseSR standard (MultiMode Fiber).
    *   *Recommendation:* We use Solarflare equipment, as it provides minimal latency with certain drivers.
*   **Network setup:** We need access to all links to the required services to configure them ourselves.

---

# Software requirements (if configured by the client)

*   **OS:** Rocky Linux 9.4 or higher.
*   **Disk layout:** Disk partitions:
    *   `/` (root) — 20 ГБ.
    *   `/var/log` — 20 ГБ, mounted on a separate partition (the final volume depends on the number of robots).
*   **Network:** Configured network interfaces for the required data flows.
*   *   **Usage:** It is not recommended to use the server for any other tasks.

---

# Requirements if software is configured by us 

*   **Installation access:** IPMI access to the server to install the operating system (if the client has not installed it).
*   **Configuration access:** Root access via SSH from specific IP addresses. We define a list of IP addresses and forward it to the client.
*   **Infrastructure:** All connected links and network interface settings must be provided.

---

# Recommendations for a bare-metal server in a data center

*   **Processor:** 2x AMD EPYC SP5 (32C, 48C, 64C) or newer. Higher clock speeds preferred.
*   **RAM:** 1 GB per core.
*   **Drives:** 2x 512 GB NVMe drives.
*   **Form Factor:** 1U with dual power supplies.
*   **Network Interface Cards:** 2x Solarflare Flareon Ultra SFN8522-PLUS (Dual-Port 10GbE SFP+, PCIe 3.1 x8).
*   **Transceivers:** 4x SFP+ 10Gb LC modules.

---

# Recommendations for a server in AWS

*   **Instance type:** `c6g.large`.
*   **Hard drive:**
    *   **Capacity (GiB):** 30
    *   **Type:** `gp3`
    *   **IOPS:** 3000
    *   **Bandwidth (MB/s):** 125
*   **OS:** RockyLinux 9.4+, AlmaLinux 9,4+.
