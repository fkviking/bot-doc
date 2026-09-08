---
title: 13. Client server requirements
section: 13
summary: 'Server requirements for hosting robots in colocation: CPU, memory, network, and data-center recommendations.'
---

# Client server requirements

The configuration of servers used to host trading robots depends on many factors, including the trading and market data connections used; the number of robots planned for deployment on the server; and the requirements of the exchange and/or the the server hoster. Clients can optionally host trading robots on their own server, located in the exchange's colocation area or another data center. There are minimum requirements and recommended specifications for such servers (bare-metal or virtual) below.

**Important!** The number and configuration of network interfaces should be clarified with the hoster of where the equipment is planned to be placed.


### Minimal hardware requirements

*   **Processor:** At least 8 cores with hyperthreading disabled.
    *   *Note:* Such configuration takes into account receiving the market data of one exchange, such as MOEX or SPBEX (and the corresponding launch of separate robots to receive UDP streams).
*   **Virtualization:** If using a virtual machine, it must support core isolation (pinning)
*   **RAM:** At least 8 GB, at a rate of 1 GB per core (more cores = more memory).
*   **Drive:** HDD or SSD with at least 40 GB of storage.
*   **Network subsystem:** In accordance with MOEX requirements, connections providing access to low latency exchange data services are provided by two physical links at 10 Gbps speeds using the 10GBaseSR standard (MultiMode Fiber).
    *   *Recommendation:* We use Solarflare equipment, as it provides minimal latency with certain drivers.
*   **Network setup:** We need access to all links to the required services to configure them ourselves.

---

### Recommendations for a bare-metal server in a data center

*   **Processor:** 2x AMD EPYC SP5 (32C, 48C, 64C) or newer. Higher clock speeds preferred.
*   **RAM:** 1 GB per core.
*   **Drives:** 2x 512 GB NVMe drives.
*   **Form Factor:** 1U with dual power supplies.
*   **Network Interface Cards:** 2x Solarflare Flareon Ultra SFN8522-PLUS (Dual-Port 10GbE SFP+, PCIe 3.1 x8).
*   **Transceivers:** 4x SFP+ 10Gb LC modules.

---

### Software requirements (if configured by the client)

*   **OS:** Rocky Linux 9.4 or higher.
*   **Disk layout:** Disk partitions:
    *   `/` (root) — 20 GB or more.
    *   `/var/log` — 20 GB, for each running robot, mounted on a separate partition.
*   **Network:** Network interfaces are configured for the required data flows.
*   **Usage:** It is recommended not to use the server for any other tasks.    

### Software requirements (if configured by us)

By agreement with the client, such configuration can be performed by us.
If the configuration is performed by us, the following access rights are required:

*   **Installation access:** IPMI access to the server to install the operating system (if the client has not installed it).
*   **Configuration access:** Root access via SSH from specific IP addresses. We define a list of IP addresses and forward it to the client.
*   **Infrastructure:** All connected links and network interface settings must be provided.

---
