# DIGITAL RESIDENTS FOR PIONEERING AND INFORMATION MANAGEMENT SYSTEM FOR BARANGAY TARUC

---

An Undergraduate Thesis Presented to
The Faculty of the College of Information Technology
Bucas Grande Foundation College
Barangay Taruc, Socorro, Surigao del Norte

---

In Partial Fulfillment of the Requirements for the Degree
**BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY**

---

**Raizy-Maricole C. Joaquino**
**Rizalyn D. Consigna**
**Kisha Mae D. Cubillanes**

---

Adviser: Elealeh Jay Consigna

---

December 2025

---

## APPROVAL SHEET

This capstone project entitled **Digital Residents for Pioneering and Information Management System for Barangay Taruc**, prepared and submitted by **Raizy-Maricole C. Joaquino**, **Rizalyn D. Consigna**, and **Kisha Mae D. Cubillanes**, has been examined and is recommended for approval and acceptance.

---

Approved by the Committee on Oral Examination during the proposal with a grade of ________ on December 16, 2025.

&nbsp;

___________________________________
**Elealeh Jay Consigna**
Adviser

&nbsp;

_____________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________
Member &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Member &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Member

&nbsp;

ACCEPTED in partial fulfillment of the requirements for the degree Bachelor of Science in Information Technology.

&nbsp;

___________________________________
**Rhea Jean Belsondra, MIT**
Dean, College of Information Technology

---

## TABLE OF CONTENTS

| Title | Page |
|---|---|
| Title Page | i |
| Approval Sheet | ii |
| Table of Contents | iii |
| Acknowledgement | v |
| Abstract | vi |
| **CHAPTER 1 – INTRODUCTION** | |
| 1.1 Project Context | 1 |
| 1.2 Purpose and Description of the Project | 3 |
| 1.3 Research Objectives | 5 |
| &nbsp;&nbsp;&nbsp;&nbsp; General Objective | 5 |
| &nbsp;&nbsp;&nbsp;&nbsp; Specific Objectives | 5 |
| 1.4 Scope and Limitations of the Study | 6 |
| &nbsp;&nbsp;&nbsp;&nbsp; Scope of the Study | 6 |
| &nbsp;&nbsp;&nbsp;&nbsp; Limitations of the Study | 7 |
| 1.5 Significance of the Study | 8 |
| **CHAPTER 2 – REVIEW OF RELATED LITERATURE** | |
| 2.1 Related Literature | 10 |
| 2.2 Synthesis | 16 |
| **CHAPTER 3 – TECHNICAL BACKGROUND** | |
| 3.1 System Architecture Overview | 18 |
| 3.2 Next.js Framework | 18 |
| 3.3 TypeScript | 19 |
| 3.4 PostgreSQL Database | 19 |
| 3.5 Prisma ORM | 20 |
| 3.6 NextAuth.js (Authentication) | 20 |
| 3.7 Tailwind CSS and shadcn/ui | 21 |
| 3.8 Recharts (Data Visualization) | 21 |
| 3.9 Leaflet and react-leaflet (GIS Mapping) | 22 |
| 3.10 pdf-lib (PDF Certificate Generation) | 22 |
| **CHAPTER 4 – METHODOLOGY** | |
| 4.1 Research Design | 23 |
| 4.2 Development Model | 23 |
| &nbsp;&nbsp;&nbsp;&nbsp; Phase 1: System Analysis and Design | 24 |
| &nbsp;&nbsp;&nbsp;&nbsp; Phase 2: Development of the System | 25 |
| &nbsp;&nbsp;&nbsp;&nbsp; Phase 3: System Testing | 27 |
| &nbsp;&nbsp;&nbsp;&nbsp; Phase 4: System Implementation | 27 |
| 4.3 System Architecture | 28 |
| 4.4 Data Gathering Procedure | 28 |
| 4.5 Tools and Technologies | 29 |
| 4.6 Database Design Summary | 30 |
| 4.7 Ethical and Security Considerations | 31 |
| **CHAPTER 5 – RESULTS AND DISCUSSION** | |
| 5.1 Implementation Results | 32 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 1. Login Page | 32 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 2. Analytics Dashboard | 33 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 3. Resident Management | 34 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 4. Household Management | 36 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 5. Document Management | 37 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 6. Blotter Recording | 39 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 7. Barangay Officials Directory | 40 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 8. Budget Management | 41 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 9. Community Projects Monitoring | 43 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 10. Health Records | 44 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 11. Disaster Management | 45 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 12. GIS Household Mapping | 47 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 13. Reports and Export | 48 |
| &nbsp;&nbsp;&nbsp;&nbsp; Figure 14. Settings Management | 49 |
| 5.2 System Evaluation | 50 |
| &nbsp;&nbsp;&nbsp;&nbsp; A. Functionality | 51 |
| &nbsp;&nbsp;&nbsp;&nbsp; B. Efficiency | 52 |
| &nbsp;&nbsp;&nbsp;&nbsp; C. Usability | 53 |
| &nbsp;&nbsp;&nbsp;&nbsp; D. Reliability | 54 |
| &nbsp;&nbsp;&nbsp;&nbsp; E. Maintainability | 55 |
| &nbsp;&nbsp;&nbsp;&nbsp; F. Portability | 56 |
| &nbsp;&nbsp;&nbsp;&nbsp; System Evaluation Summary | 57 |
| 5.3 Key Achievements | 58 |
| 5.4 System Advantages | 59 |
| 5.5 Comparison with Traditional Methods | 60 |
| 5.6 Limitations and Future Enhancements | 61 |
| **CHAPTER 6 – SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS** | |
| 6.1 Summary | 62 |
| 6.2 Conclusions | 63 |
| 6.3 Recommendations | 64 |
| References | 65 |
| Curriculum Vitae | 68 |

---

## ACKNOWLEDGEMENT

The researchers would like to express their most sincere and heartfelt gratitude to the individuals whose guidance, encouragement, and support made the completion of this capstone project possible.

To our Research Adviser, **Elealeh Jay Consigna**, we extend our deepest appreciation for his invaluable guidance, steadfast patience, and insightful feedback throughout every stage of the research and development process. His expertise in information systems and his unwavering dedication to the success of this study have been instrumental in shaping this project into its final form.

To the **Dean of the College of Information Technology, Rhea Jean Belsondra, MIT**, and to all the faculty members and panel members who evaluated and gave constructive feedback on our work — thank you for your time, your scholarly perspectives, and your commitment to academic excellence.

To the **Barangay Officials and Staff of Barangay Taruc** — particularly the Barangay Captain, Secretary, Treasurer, and Kagawad members — we are deeply grateful for your willingness to participate in interviews, share your experiences with manual administrative processes, and validate the features developed in this system. Your cooperation and trust were indispensable to the success of this study.

To our **families and loved ones**, who provided encouragement, understanding, and unwavering moral support throughout the most challenging moments of this academic journey — your presence sustains us in everything we do.

To our **co-researchers and batchmates** in the College of Information Technology, thank you for the shared laughter, late nights, and collective perseverance that made this journey bearable and meaningful.

Above all, we offer our gratitude to **God Almighty**, for the wisdom, health, and strength granted to us each day as we worked toward the completion of this endeavor.

&nbsp;

**Raizy-Maricole C. Joaquino**
**Rizalyn D. Consigna**
**Kisha Mae D. Cubillanes**

---

## ABSTRACT

The rapid advancement of digital technology has significantly transformed the way local government units manage information and deliver public services. However, many barangays in the Philippines, including Barangay Taruc in Socorro, Surigao del Norte, still rely on manual and paper-based systems for resident record management, document processing, and administrative operations. These traditional methods often result in inefficiencies such as delayed transactions, data inconsistency, difficulty in record retrieval, and an increased risk of data loss, misplacement, and deterioration.

This study aimed to design, develop, and evaluate a **Digital Residents for Pioneering and Information Management System for Barangay Taruc** — a comprehensive, web-based platform designed to address these longstanding operational challenges. The proposed system serves as a centralized digital platform for managing resident profiles, household information, barangay document issuance, blotter recording, budget management, community projects monitoring, health records, disaster preparedness, and geographic household mapping. It is designed to automate routine administrative tasks, enhance data accuracy, improve service efficiency, and ensure the secure storage of community records.

The system was developed using a modern full-stack technology architecture composed of Next.js 16 with the App Router, TypeScript, PostgreSQL, Prisma ORM, NextAuth.js v4, Tailwind CSS v4, and shadcn/ui. Supporting libraries include Recharts for data visualization, Leaflet and react-leaflet for interactive GIS mapping, and pdf-lib for automated PDF document generation.

The system encompasses fourteen (14) core functional modules: Resident Management, Household Management, Document Issuance (twelve document types), Blotter Recording, Barangay Officials Directory, Budget Management, Community Projects Monitoring, Health Records, Disaster Management, GIS Household Mapping, Analytics Dashboard, Report Generation, User Authentication with Role-Based Access Control (six defined roles), and Settings Management.

System evaluation was conducted based on the ISO 9126-1 software quality model, assessing the system across six quality characteristics: Functionality, Efficiency, Usability, Reliability, Maintainability, and Portability. Overall assessment results confirmed that the system meets the requirements for a reliable, user-friendly, and maintainable barangay information management platform.

The implementation of this digital information management system is expected to improve the quality of barangay services, strengthen administrative transparency, support data-driven planning and decision-making, and contribute to the modernization of local governance in Barangay Taruc — aligned with national initiatives promoting digital transformation in Philippine local government units.

**Keywords:** Barangay Information System, Digital Profiling, Resident Management, Document Issuance, Disaster Management, GIS Mapping, Role-Based Access Control, Next.js, Local Governance

---

# CHAPTER 1
## INTRODUCTION

The rapid advancement of digital technologies has significantly influenced how local government units (LGUs) manage information and deliver services to their constituents. In many barangays across the Bucas Grande Island, Surigao del Norte, record-keeping and administrative tasks continue to rely heavily on manual processes such as handwritten logbooks, paper forms, and physical filing systems. While these methods have traditionally served communities, they pose increasing challenges as population size grows and demands for faster, more accurate, and more transparent services continue to rise.

In Barangay Taruc, the need for an updated and efficient information management system has become increasingly apparent. Manual record-keeping procedures result in a range of issues: misplaced documents, inconsistent resident records, slow data retrieval, difficulty in generating statistical reports, and an inability to effectively coordinate across different administrative functions. These functions span from document issuance and incident case recording to budget monitoring, community project tracking, health data management, and disaster response. With the aim of improving public service quality, enhancing administrative efficiency, and ensuring the reliable storage of community data, a transition toward digital solutions becomes not merely advantageous but essential.

The **Digital Residents for Pioneering and Information Management System for Barangay Taruc** is envisioned as a modern, technology-driven intervention to address these challenges comprehensively. By digitizing resident profiles, automating document issuance, centralizing community information, and integrating specialized modules for blotter recording, budget management, health tracking, disaster preparedness, and geographic mapping, the barangay can substantially improve service delivery across all its administrative functions — while ensuring that community data remains secure, organized, and readily accessible when needed.

### 1.1 Project Context

Barangay Taruc serves as one of the fundamental governance units within the Municipality of Socorro, providing frontline services and maintaining records essential for community welfare. The barangay is named after Don Albino Taruc, and it serves as the location of Bucas Grande Foundation College (BGFC), making it a center of academic and civic activity in the area. However, traditional operational methods continue to limit the barangay's ability to manage growing data demands effectively. Paper-based systems require significant time and human effort, are prone to error, and can be damaged or entirely lost due to environmental factors such as typhoons, flooding, and general deterioration — hazards particularly relevant in Surigao del Norte, which falls within a typhoon-prone region of the country.

Recognizing the need for modernization, the proposed Digital Residents for Pioneering and Information Management System aims to reinvent the way Barangay Taruc collects, stores, processes, and retrieves information across all of its core administrative functions. This system introduces a streamlined, technology-driven approach wherein all resident data — including household information, demographic profiles, community memberships, health statuses, and social welfare program affiliations — are securely stored in a centralized digital database.

The system integrates a document issuance module that enables barangay staff to quickly generate and release official certifications. These include the Barangay Clearance, Certificate of Indigency, Certificate of Residency, Certificate of Good Moral Character, First-Time Job Seeker Certificate, Solo Parent Certificate, Business Permit Endorsement, Barangay ID, Cedula (Community Tax Certificate), SK Certification, Senior Citizen ID Endorsement, and PWD ID Endorsement — each automatically formatted with barangay letterhead, official details, and assigned a unique control number for tracking and accountability.

Beyond document management, the system provides a blotter module for recording and tracking incident reports and case hearing schedules, a budget module for managing financial allocations and transactions per budget year, a projects module for monitoring community programs and their implementation progress, and a health records module for tracking resident health information and community health program data. A disaster management module supports the documentation of disaster events, evacuation center management, missing persons tracking, and affected household profiling with geographic risk classification. An interactive GIS-based map module enables visual representation of household locations across the barangay's puroks using coordinate-based data plotted on an OpenStreetMap interface. An officials directory maintains a digital record of incumbent barangay officials with photo management capabilities. A comprehensive analytics dashboard and report generation module provide data-driven insights to support planning and decision-making at the barangay level.

By adopting this system, Barangay Taruc can take a pioneering step toward digital transformation, aligning with national government initiatives that encourage technology-based solutions for local governance and positioning the barangay as a model for digital modernization among its peers in the municipality.

### 1.2 Purpose and Description of the Project

The primary purpose of this study is to design, develop, and evaluate an efficient, comprehensive information management system tailored specifically for Barangay Taruc. This system seeks to replace outdated manual processes with a structured, secure, and user-friendly digital platform that covers the full scope of barangay administrative operations.

The system is conceived as a unified web application that consolidates all barangay data management functions into a single, role-secured platform accessible to authorized barangay personnel. Rather than maintaining separate, disconnected logbooks and filing systems for each administrative area, barangay staff may utilize this system to manage all data from one centralized interface, with appropriate access controls ensuring that sensitive information is available only to those with the proper authorization.

The system is specifically designed to:

- Serve as a centralized digital repository of all resident and household information, including demographic profiles, social welfare affiliations, government ID references, and community memberships;
- Automate the generation and issuance of twelve (12) types of official barangay documents with proper control numbering and formatted PDF output;
- Provide a structured blotter recording system for incident reports and complaint case management, with a defined status workflow for tracking case progress;
- Enable budget planning, financial allocation tracking, and transaction recording per budget year, organized by funding category;
- Support the monitoring of community projects and barangay programs with status updates and progress history logging;
- Maintain health records for residents to support health program coordination and monitoring;
- Facilitate disaster preparedness and response documentation, including disaster event management, evacuation center administration, missing persons tracking, and affected household risk profiling;
- Provide an interactive map interface for geographic visualization of household locations across the barangay's puroks;
- Maintain a digital directory of barangay officials with portrait photo management capabilities;
- Generate analytical reports and dashboard statistics to support data-driven planning and decision-making;
- Enforce role-based access control to ensure that only authorized users can view or modify sensitive records, with six defined user roles each carrying distinct permissions;
- Reduce manual workload, minimize human error, and improve overall administrative transparency and accountability.

By introducing these digital capabilities, the proposed system supports Barangay Taruc in its goal to strengthen administrative transparency, streamline service delivery, and elevate the quality of local governance for the benefit of its constituents.

### 1.3 Research Objectives

#### General Objective

To develop a comprehensive digital information management system that enhances the accuracy, efficiency, and reliability of resident records and administrative operations in Barangay Taruc, covering all core barangay functions through an integrated, web-based platform with role-based access control and automated data processing capabilities.

#### Specific Objectives

- To design and implement a centralized system that securely stores and manages resident and household profiles, including Philippine-specific demographic fields, government ID references, and social welfare classifications;
- To automate the creation and issuance of twelve (12) types of barangay documents with control number generation, PDF output, and a structured status workflow for faster transaction processing;
- To implement a role-based user authentication and access control system with six defined roles (Super Admin, Captain, Secretary, Treasurer, Kagawad, SK Chairman) that protect sensitive community data and ensure proper authorization;
- To develop a structured blotter module for recording, tracking, and managing incident complaints and case hearing schedules with a defined case status workflow;
- To provide budget management functionality that enables financial allocation tracking, transaction recording, and balance monitoring per budget year and funding category;
- To support the monitoring of community projects and barangay programs with status tracking, progress history, and update logging;
- To maintain health records for residents that support barangay health program coordination and monitoring;
- To develop a disaster management module that documents disaster events, manages evacuation centers, tracks missing persons, and profiles affected households by geographic risk level;
- To implement an interactive GIS-based map module that plots household locations across the barangay's puroks using coordinate data on an OpenStreetMap interface;
- To provide an analytics dashboard and report generation tools that deliver data-driven insights for barangay planning and administrative purposes;
- To offer an intuitive and user-friendly interface suitable for barangay staff with varying levels of computer proficiency;
- To test and evaluate system performance based on the ISO 9126-1 quality model, ensuring reliability, usability, and maintainability in daily barangay operations.

### 1.4 Scope and Limitations of the Study

#### Scope of the Study

This study focuses on the design, creation, implementation, and evaluation of the Digital Residents for Pioneering and Information Management System for Barangay Taruc. The system includes the following modules and features within its operational scope:

- **Resident Management** — Registration, comprehensive demographic profiling (including Philippine-specific fields such as civil status variants, purok affiliation, government ID numbers, and social welfare classifications), record editing, search and filtering by multiple criteria, bulk operations, and CSV import functionality for all barangay residents;
- **Household Management** — Household creation and tracking with purok assignment, housing profile data (type, roof and wall materials, toilet and water source), 4Ps beneficiary designation, GPS coordinate recording, member listing, and household head designation;
- **Document Issuance** — Automated generation of twelve (12) types of official barangay documents in PDF format, with control number assignment, resident and barangay detail pre-filling, a defined status workflow (Pending → Processing → Ready → Released, with Rejected and Cancelled states), and fee tracking;
- **Blotter Recording** — Incident and complaint recording with nature of complaint classification, complainant and respondent linkage to resident profiles, case status management (Filed → Under Mediation → Settled / Escalated / Closed / Withdrawn), and hearing schedule logging;
- **Budget Management** — Annual budget planning, fund allocation by category (Personal Services, MOOE, Capital Outlay, Trust Fund), financial transaction recording, and balance tracking per budget year;
- **Community Projects Monitoring** — Creation and tracking of barangay programs and projects with status tracking (Planned, Ongoing, Completed, Suspended, Cancelled), timeline data, and progress update history;
- **Health Records** — Documentation of resident health data, including profiles relevant to senior citizens, persons with disability, maternal health, and immunization tracking, to support barangay health program coordination;
- **Disaster Management** — Disaster event documentation (typhoons, floods, earthquakes, and other hazards) with status tracking (ACTIVE, STANDDOWN, DRILL, ENDED), evacuation center administration (name, address, capacity, coordinates), missing persons reporting with found/unfound status, and affected household profiling by risk level (HIGH, MEDIUM, LOW, SAFE) with evacuation status tracking;
- **GIS Household Mapping** — An interactive geographic map module for visualizing household locations across the barangay's puroks using coordinate-based data plotted on OpenStreetMap via Leaflet;
- **Officials Directory** — A digital directory of incumbent barangay officials with portrait photo management via cloud-based image storage;
- **Analytics Dashboard** — Summary statistics and visual charts covering population demographics, document activity, disaster preparedness data, and program information;
- **Report Generation** — Data export and CSV report generation tools for planning and administrative purposes, covering residents, disaster profiles, evacuation centers, and missing persons;
- **User Authentication and Role-Based Access Control** — Credential-based login with six (6) defined roles (Super Admin, Captain, Secretary, Treasurer, Kagawad, SK Chairman), each with distinct module-level access permissions;
- **Settings Management** — Administration of barangay configurations, purok definitions, and user account management.

#### Limitations of the Study

- The system is designed and configured specifically for Barangay Taruc; adaptation for deployment in other barangays would require reconfiguration of barangay-specific settings, branding, purok definitions, and data;
- Internet connectivity limitations or constrained hardware resources within the barangay may affect system speed, responsiveness, and general usability;
- The accuracy of records maintained in the system relies heavily on the correctness and completeness of inputs provided by barangay staff during data encoding; the system does not independently verify the truthfulness of submitted information;
- The system does not support real-time integration with municipal-level or national government databases, such as PhilSys, PhilHealth, SSS, or GSIS records;
- Mobile applications or SMS-based notification features are not included in the current implementation scope;
- Financial data recorded in the budget module is intended for internal barangay tracking and has not been designed to comply with formal Commission on Audit (COA) reporting requirements or government accounting standards;
- The health records module is intended as a basic documentation tool and does not replicate the full functionality of a clinical electronic medical record (EMR) system.

### 1.5 Significance of the Study

The development and implementation of the Digital Residents for Pioneering and Information Management System for Barangay Taruc carries significant value for various groups of stakeholders, as described below.

**Barangay Officials**

The system improves administrative transparency, simplifies complex operational processes, and provides accurate, up-to-date data essential for planning, reporting, and decision-making across all barangay functions. The analytics dashboard and report generation tools enable officials to quickly assess community conditions, population demographics, program progress, and disaster preparedness status — facilitating more responsive and evidence-based governance.

**Barangay Staff**

For barangay staff tasked with day-to-day administrative responsibilities, the system substantially reduces manual workload and eliminates redundant tasks. It increases accuracy, enables quick access to organized resident information, and supports efficient execution of administrative duties. Automated document generation, structured blotter recording, digital budget tracking, and role-specific access control allow staff to work with greater confidence, competence, and efficiency.

**Residents of Barangay Taruc**

Community members benefit directly from faster and more reliable barangay services. Reduced document processing time, improved record accuracy, and more organized administrative operations translate into a tangible improvement in the quality of local governance experienced by residents. The system ensures that residents can expect consistent, fair, and timely service from their local government.

**Local Government Units (LGUs)**

The system aligns with national government initiatives and policies promoting digital governance, e-government services, and the use of information and communications technology (ICT) in public administration. It supports LGUs in achieving standardization and modernization in data management and public service delivery, positioning Barangay Taruc as a model for digital transformation within the Municipality of Socorro and across Surigao del Norte.

**Future Researchers and Developers**

This study may serve as a valuable reference or foundational model for similar projects involving digital information systems for local government units, barangay automation, community-based data management, and the implementation of full-stack web applications in public sector contexts. The technology architecture, module design, and implementation strategies documented in this study can inform and guide future development efforts at various levels of local governance.

**The Academic Community**

This study contributes to the growing body of research on e-governance, local government information systems, and the application of modern web technologies in Philippine public administration. It demonstrates a practical, real-world application of full-stack development principles in a community service context, enriching the academic literature available to students, researchers, and practitioners in the field of information technology.

---

# CHAPTER 2
## REVIEW OF RELATED LITERATURE

### 2.1 Related Literature

The integration of digital systems within local government units has become an essential step toward improving service delivery, enhancing information accuracy, and meeting the increasing expectations of communities. Various studies highlight how technology can reshape administrative operations, streamline workflows, and promote transparency across multiple governance functions.

According to David et al. (2023), digital transformation in public governance enhances the efficiency of administrative processes by automating records, transactions, and reporting procedures. This transformation enables local units to deliver services more accurately and promptly, reducing bottlenecks associated with manual documentation. The adoption of digital tools also promotes accountability by ensuring that records are stored systematically and are easily retrievable when needed. Their review of local government digital technology adoption strategies underscores that municipalities and barangays which embrace technology-driven approaches consistently demonstrate improved service quality metrics and reduced administrative overhead.

In the study of Imus et al. (2018), information systems in barangays strengthen data accuracy by centralizing demographic profiles, household information, and community records into a unified database. Such systems reduce the tendency for human errors common in handwritten logs and support local government personnel in executing tasks more efficiently. Digital platforms also help maintain document uniformity, particularly in generating certifications and official forms. The Barangay Management Information System (BMIS) examined in their study showed that barangays utilizing centralized digital platforms reported significantly fewer instances of record duplication and data loss compared to those relying entirely on manual methods.

Lacasandile et al. (2020) assert that the digitization of resident databases provides local governments with essential insights for decision-making. Accurate records empower barangays to plan appropriately for social welfare programs, resource allocation, disaster response, and community profiling. Their development of the Barangay Information Profiling System (BIPS) demonstrated that automated information dashboards could present population data and service statistics in real time, enabling barangay officials to make faster, more data-informed decisions. Considering the increasing need for real-time data, the shift from manual processes to computerized systems is described by the authors as indispensable for modern local governance.

Similarly, Bondoc (2019) found that implementing automated document issuance systems in barangays significantly cuts processing time, reduces workload, and avoids inconsistencies in document formatting. Automation also enhances public satisfaction by offering quicker, more organized, and more transparent service transactions. The e-Barangay system examined in the study showed that average document processing time was reduced from several days under manual processes to just a matter of hours upon system implementation. These findings strongly support the inclusion of automated document generation as a core feature of any modern barangay information system.

A study by Melendres and Aranda (2024) emphasizes that transitioning to digital systems in local government units helps minimize the risk of losing important records due to physical damage, misplacement, or deterioration over time. Digital databases improve the security of resident profiles through controlled user access, encryption, and systematic backups — ensuring that sensitive information remains protected. The Web-Based Resident Information Management System developed in their study confirmed that staff experienced measurably lower rates of data retrieval failure and record loss after the transition from paper-based to digital storage.

Moreover, Schoegje et al. (2023) highlight that automated information management systems provide significant advantages for administrators by enabling search and filtering tools within databases. These functions facilitate fast retrieval of records, efficient updating of resident details, and reliable generation of reports for legislative and administrative purposes. Their study on web-based search efficiency emphasized that systems designed with intuitive filtering and search functionalities dramatically reduce the time administrators spend locating records — a finding that directly informed the design of the resident and household search features in the present system.

A separate study by Li et al. (2022) discusses how computerized systems allow local government staff — even those with limited technical skills — to perform tasks more effectively through user-friendly interface design. Intuitive interfaces reduce training requirements while ensuring accuracy in data input and retrieval. Their research on optimal information management system design for government emphasized that interface simplicity, consistent visual language, and clear navigational structures are critical factors in ensuring staff adoption and sustained system use.

The management of incident records and community disputes is another area significantly improved by digital systems. Gedorio et al. (2023) note that digital blotter systems in barangays enable more organized recording and tracking of complaints, with structured case workflows that help officials monitor hearing schedules and resolution status. Compared to handwritten logbooks, digital blotter systems provide faster retrieval of case histories and a more consistent format for official documentation. Their study of the Barangay Blotter and Clearance System in Cagayan, Philippines, demonstrated that a digital case management approach reduced case tracking errors by a significant margin and improved the barangay's capacity to follow up on pending complaints and scheduled hearings in a timely manner.

Financial management within barangays has also been a subject of significant digitalization efforts. Lorenzo et al. (2021) found that digitized budget management systems help local government units track fund allocations and expenditures with greater precision, reducing the risks of misappropriation and inconsistency that often arise from manual financial recording. By maintaining a structured record of budget years, allocations by category, and individual transactions, such systems support both transparency and internal accountability. Their study of the budget allocation system of a highly urbanized local government unit in Central Luzon confirmed that digital budget tracking led to improved audit readiness and reduced discrepancies in financial reporting.

The monitoring of community projects and local government programs benefits significantly from digital tools. According to Javellana et al. (2015), project tracking systems enable barangay administrators to record, monitor, and update the status of ongoing initiatives in real time, making it easier to evaluate program implementation and coordinate resource deployment effectively. Their Integrated Information Management System for Barangay 1-A Davao demonstrated that digital project monitoring reduced the frequency of program oversight failures and enabled more responsive adjustments to implementation timelines and resource allocation — outcomes directly relevant to the community projects module of the present study.

Health data management at the barangay level is equally critical to community welfare. Ongkeko et al. (2016) stress that local health record systems allow barangay health workers and administrators to maintain updated profiles on residents' medical conditions, enabling better coordination with municipal health offices and more responsive implementation of community health programs. Their evaluation of the Community Health Information and Tracking System (CHITS) after eight years of implementation in the Philippines confirmed that electronic health records at the community level improved continuity of care, reduced data redundancy, and supported more accurate health program targeting compared to paper-based health recording systems.

Disaster preparedness and response management represents one of the most urgent use cases for digital systems at the barangay level, particularly in disaster-prone regions such as Surigao del Norte. Garcia et al. (2016) emphasize that communities exposed to natural hazards require rapid and organized information during and after disaster events. Digital disaster management modules allow barangays to record affected households, track missing persons, manage evacuation center capacities, and maintain a geographic reference of vulnerable areas — all of which are critical for an effective and coordinated emergency response. Their study of a Barangay Disaster Preparedness Monitoring Web Application System highlighted the significant advantages of linking disaster data with geographic information, enabling barangay officials to visualize vulnerability patterns and coordinate response efforts more efficiently.

Geographic information systems (GIS) have become increasingly relevant in local governance for their capacity to visualize and analyze spatial data. Iglesias (2010) found that barangay-level GIS mapping tools significantly improve the planning of community programs by allowing officials to visualize household distributions, identify geographically vulnerable areas, and prioritize resource delivery based on location data. The integration of interactive mapping in barangay systems bridges the gap between administrative data and spatial decision-making, enabling a more nuanced and geographically aware approach to local governance. This foundational insight directly informs the GIS mapping module of the present system, which plots household locations and disaster risk data on an interactive map interface.

The effectiveness of digital governance extends beyond administrative convenience. According to De La Serna and Bringula (2022), barangay information systems directly influence the quality of public service delivery. Faster transactions, improved record accuracy, and organized databases enhance the trust of residents in their local government. Their E-Barangay framework study demonstrated that residents consistently rated digital service experiences as superior to manual processes in terms of speed, clarity, and reliability — confirming that the benefits of digitalization extend to the community level and not merely to internal administrative operations.

Furthermore, digital systems support barangay officials in executing program-based decisions. By evaluating population statistics, indigency records, and household conditions, barangays formulate initiatives that are more responsive to actual community needs (Javellana et al., 2015). The ability to query and filter large volumes of resident data quickly enables barangay planners to identify vulnerable populations, track program beneficiaries, and assess the distributional impact of existing programs.

In implementing digital platforms, Cardos et al. (2025) stress the importance of role-based user access, which ensures that only authorized personnel can modify or view sensitive resident data. This supports compliance with data privacy regulations — including the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) — and enhances the integrity of public information. Their evaluation of role-based access control in a government evaluation system confirmed that clearly defined role hierarchies with appropriate permission boundaries significantly reduced instances of unauthorized data access and improved user confidence in system security.

Several existing systems share similarities with the Digital Residents for Pioneering and Information Management System, illustrating the growing shift toward digitalized barangay operations throughout the Philippines. The Barangay Management Information System (BMIS) implemented in various municipalities focuses on storing resident profiles, generating barangay clearances, and tracking household data. Studies show that BMIS significantly improves data organization and helps reduce clerical errors (Imus et al., 2018). Another system, the e-Barangay Information System, automates service requests such as document issuance and resident data management. Researchers note that the system reduces transaction time and contributes to efficient workflow among staff members (Bondoc, 2019). These precedent systems affirm the viability and value of the approach taken in the present study.

### 2.2 Synthesis

The reviewed literature and related systems collectively affirm the critical role of technology in transforming local government operations. Across all studies, recurring themes highlight the advantages of digital platforms, including improved data accuracy, reduced administrative workload, enhanced data security, and substantially faster service delivery. Technology enables barangays to maintain centralized, organized, and easily retrievable data systems, supporting better planning, decision-making, and public service efficiency at the community level.

The studies reviewed collectively identify specific functional domains in which digital systems deliver the most substantial benefits: resident and household profiling (Imus et al., 2018; Lacasandile et al., 2020; Melendres & Aranda, 2024), document issuance automation (Bondoc, 2019), blotter and case management (Gedorio et al., 2023), budget and financial tracking (Lorenzo et al., 2021), community project monitoring (Javellana et al., 2015), health data management (Ongkeko et al., 2016), disaster preparedness and response (Garcia et al., 2016), and geographic information visualization (Iglesias, 2010). These are precisely the functional domains addressed by the Digital Residents for Pioneering and Information Management System for Barangay Taruc.

The reviewed literature also affirms the importance of role-based access control (Cardos et al., 2025), user interface design that accommodates varying levels of technical proficiency (Li et al., 2022), and the integration of search and filtering tools for efficient data retrieval (Schoegje et al., 2023). These design principles are embedded throughout the architecture and interface of the present system.

Crucially, while several of the reviewed systems address one or a few of these functional domains in isolation, the literature consistently calls for a more integrated, holistic approach to barangay digital governance — one that unifies multiple administrative functions within a single, coherent platform. The Digital Residents for Pioneering and Information Management System for Barangay Taruc responds directly to this established need by providing a unified platform that addresses not only resident profiling and document issuance, but also blotter case management, budget and financial tracking, community project monitoring, health records management, disaster preparedness and response, GIS-based household mapping, and barangay officials management.

This integrated approach reflects the comprehensive direction called for in the literature — moving beyond singular-function systems toward holistic digital governance platforms that cover the full breadth of barangay administrative responsibilities. By consolidating these functions into a single, role-secured, web-based system, Barangay Taruc is positioned to significantly improve service delivery, administrative efficiency, and community data management in alignment with national digital governance initiatives and the Philippine government's ongoing push for e-government transformation at the grassroots level.

---

# CHAPTER 3
## TECHNICAL BACKGROUND

### 3.1 System Architecture Overview

The Digital Residents for Pioneering and Information Management System for Barangay Taruc is built upon a modern, full-stack web application architecture that separates concerns between client-side presentation, server-side business logic, and persistent data storage. The system follows a layered architecture model: the presentation layer is managed by React components rendered through Next.js (with both server-side and client-side rendering strategies employed as appropriate), the application logic layer is handled by Next.js API routes and server actions, and the data persistence layer is managed by PostgreSQL accessed through the Prisma ORM. Authentication and session management are handled by NextAuth.js across all layers. The entire application is written in TypeScript, ensuring type safety and maintainability across the full stack.

The technology stack comprises: Next.js 16 (App Router), TypeScript, PostgreSQL, Prisma ORM with the `@prisma/adapter-pg` driver adapter, NextAuth.js v4, Tailwind CSS v4, shadcn/ui (built on Radix UI primitives), Recharts, Leaflet with react-leaflet, pdf-lib, and bcryptjs.

### 3.2 Next.js Framework

Next.js serves as the foundation of the system, providing a powerful React-based framework for building full-stack web applications with a unified codebase. In the present system, Next.js 16 with the App Router architecture handles all aspects of the application including page rendering, API endpoints, and server-side data operations.

Key capabilities utilized include:

- **Server-Side Rendering (SSR):** Ensures that pages are rendered on the server with current data before being sent to the client, providing fast initial page loads and ensuring that barangay staff always see up-to-date information;
- **API Routes:** Built-in backend functionality through the `src/app/api/` directory that processes HTTP requests, performs database operations via Prisma, validates input data, enforces authorization, and manages business logic for all modules;
- **App Router Architecture:** A modern file-based routing system that organizes pages, layouts, loading states, and API endpoints in a hierarchical directory structure, supporting nested layouts and parallel route handling;
- **Server Components and Client Components:** The system strategically employs React Server Components for data-fetching pages to minimize client-side JavaScript bundle size, while Client Components are used for interactive UI elements requiring browser APIs or state management;
- **Authentication Integration:** Seamless integration with NextAuth.js for secure, session-aware rendering of protected pages and role-based content visibility;
- **Optimized Performance:** Automatic code splitting, static optimization, and image handling ensure fast page loads even on slower internet connections typical of rural barangay environments.

### 3.3 TypeScript

TypeScript is used throughout the entire application codebase, adding static type safety and significantly enhancing the developer experience and code maintainability.

Key contributions include:

- **Type Checking:** Compile-time error detection prevents type mismatches and undefined property access before code reaches the production environment, ensuring data integrity across all module operations;
- **Prisma-Generated Types:** Prisma automatically generates TypeScript type definitions from the database schema, ensuring that all database query results are strongly typed and that schema changes are immediately reflected in compile-time type errors;
- **Interface Definitions:** Explicit interfaces for API request/response structures, session objects, and UI component props make the codebase self-documenting and easier to maintain and extend;
- **Strict Mode:** TypeScript strict mode is enabled throughout the project, enforcing best practices and preventing a broad class of common programming errors;
- **IDE Integration:** TypeScript's language server provides comprehensive autocomplete, inline documentation, and refactoring tools across all code editors, accelerating development and reducing the likelihood of implementation errors.

### 3.4 PostgreSQL Database

PostgreSQL serves as the system's robust, production-ready relational database management system, storing all critical barangay data with strong consistency guarantees and relational integrity. PostgreSQL was selected for its proven reliability in production environments, advanced query capabilities, and excellent support through the Prisma ORM.

The database schema manages the following data entities and their relationships:

- **Users:** Staff accounts with defined roles and securely hashed authentication credentials;
- **Puroks:** Barangay subdivisions used for organizing households and residents geographically;
- **Households:** Full household profiles including address, purok assignment, GPS coordinates, housing type, roof and wall materials, water source, toilet type, and 4Ps designation;
- **Residents:** Complete demographic data, government ID references (PhilHealth, SSS, Pag-IBIG, TIN, PhilSys), social welfare classifications, and household linkage;
- **Document Requests:** Document type, status, control number, PDF generation records, requesting resident details, fee information, and timestamps;
- **Blotter Records and Hearings:** Incident reports, complaint nature, complainant and respondent linkages, case status, and hearing schedules;
- **Barangay Officials:** Official names, positions, terms, and portrait photo references;
- **Budget Data:** Budget years, allocations by category, and individual transaction records;
- **Projects and Updates:** Community project details, status, timelines, and progress update history;
- **Health Records:** Resident health data organized by health program category;
- **Disaster Events and Profiles:** Disaster event records, household disaster risk profiles, evacuation center data, and missing person reports;
- **Relational Integrity:** Foreign key constraints ensure referential consistency, and cascade delete behaviors are configured to maintain data integrity across related records.

### 3.5 Prisma ORM

Prisma serves as the object-relational mapping (ORM) layer between the application and the PostgreSQL database, providing type-safe database access and comprehensive migration management. In this system, Prisma version 7 is used with the `@prisma/adapter-pg` driver adapter, which enables connection pooling and optimized query performance for a PostgreSQL backend.

Key features include:

- **Type-Safe Database Access:** Auto-generated TypeScript client types derived from the Prisma schema (`prisma/schema.prisma`) ensure that all database queries are type-checked at compile time;
- **Migration Management:** Version-controlled schema migrations tracked in the `prisma/migrations/` directory ensure consistent and reproducible database deployments;
- **Expressive Query API:** Prisma Client provides an intuitive, fluent API for constructing complex queries with filtering, sorting, pagination, nested relation loading, and aggregations;
- **Database Abstraction:** Prisma abstracts the underlying SQL dialect, simplifying query construction while maintaining the full performance capabilities of PostgreSQL;
- **Singleton Pattern:** The system uses a singleton Prisma Client instance (`src/lib/prisma.ts`) to prevent connection pool exhaustion in the Next.js development environment and production deployments.

### 3.6 NextAuth.js (Authentication)

NextAuth.js v4 provides enterprise-grade authentication and session management for the system, implementing a Credentials provider flow with JWT-based session tokens and role-aware middleware protection.

Implementation details include:

- **Credentials Provider:** A custom email-and-password authentication flow that validates credentials against hashed passwords stored in the PostgreSQL database using bcryptjs;
- **JWT Session Strategy:** Session state is encoded in a secure, server-signed JSON Web Token stored in an HTTP-only cookie, preventing client-side session manipulation;
- **Role Encoding in Session:** The authenticated user's role is encoded into the JWT payload, making it available server-side for authorization decisions in API routes and middleware;
- **Middleware Protection:** A global Next.js middleware (`src/middleware.ts`) intercepts all requests to protected routes, verifies session validity, and enforces role-based access control, redirecting unauthorized requests to the login page or an access-denied page;
- **RBAC Implementation:** Six user roles are defined — Super Admin, Captain, Secretary, Treasurer, Kagawad, and SK Chairman — each with a defined permission matrix that governs access to module pages and API operations;
- **Password Security:** bcryptjs is used for hashing and verifying passwords, ensuring that plaintext credentials are never stored in the database.

### 3.7 Tailwind CSS and shadcn/ui

Tailwind CSS v4 provides the utility-first styling framework for the system's interface, enabling rapid, consistent, and responsive UI development without requiring custom CSS authoring for the majority of design decisions.

shadcn/ui, built on Radix UI primitives, supplies a comprehensive library of accessible, customizable, and composable UI components that form the building blocks of the system's interface.

Key design and component features include:

- **Consistent Design System:** Pre-built components including data tables, form inputs, dialogs, dropdown menus, tabs, cards, badges, and tooltips provide visual consistency across all modules;
- **Responsive Layout:** Tailwind's mobile-first responsive utility classes ensure that the interface adapts gracefully to different screen sizes, supporting use on desktop workstations and tablet devices;
- **Accessibility:** Radix UI primitives implement WAI-ARIA roles, keyboard navigation, and focus management, ensuring that the system is usable by staff with varying accessibility needs;
- **Dark/Light Mode:** The Tailwind CSS v4 `@theme inline` pattern and CSS custom properties support consistent theming across the application.

### 3.8 Recharts (Data Visualization)

Recharts provides the charting and data visualization capabilities displayed on the analytics dashboard, transforming raw database statistics into meaningful visual representations that support barangay planning and decision-making.

Dashboard charts implemented include:

- **Age Distribution Chart:** A bar or area chart displaying the population distribution across standard age brackets (0–14, 15–30, 31–59, 60+), segmented by sex;
- **Sex Ratio Chart:** A pie or donut chart showing the proportion of male and female residents;
- **Population by Purok Chart:** A bar chart showing resident counts per purok, enabling geographic distribution analysis;
- **Civil Status Distribution:** A chart displaying the breakdown of residents by civil status category (Single, Married, Widowed, Separated, Annulled, Live-in);
- **Disaster Preparedness Charts:** Visual representations of household risk level distributions (HIGH, MEDIUM, LOW, SAFE) and evacuation/missing persons overview for the active disaster event.

### 3.9 Leaflet and react-leaflet (GIS Mapping)

Leaflet, integrated via the react-leaflet wrapper library, provides the interactive map functionality that powers the system's GIS household mapping and disaster management map features.

Map capabilities include:

- **Household Location Plotting:** GPS coordinates stored for each household are rendered as interactive markers on an OpenStreetMap base layer, enabling geographic visualization of the barangay's residential distribution;
- **Purok-Based Organization:** Households can be color-coded or grouped by purok assignment, facilitating geographic analysis of purok boundaries;
- **Disaster Map Integration:** The disaster management module uses a dedicated map view that displays households color-coded by risk level, evacuation center markers, and an interactive "Add evacuation center here" functionality triggered by map click events;
- **Barangay-Centered View:** The map is initialized and centered on the geographic coordinates of Barangay Taruc, Socorro, Surigao del Norte.

### 3.10 pdf-lib (PDF Certificate Generation)

pdf-lib enables fully programmatic PDF document generation within the Node.js server environment, eliminating the need for third-party PDF generation services or browser-based printing for official barangay document issuance.

Implementation features include:

- **Document Templates:** Structured PDF layouts are programmatically composed for each of the twelve document types, incorporating barangay letterhead, official seals or headers, and properly formatted certificate body text;
- **Control Number Assignment:** Each generated document is assigned a unique control number automatically, enabling tracking, retrieval, and accountability for all issued documents;
- **Data Pre-filling:** Resident name, address, purpose, date, and other relevant details are retrieved from the database and embedded directly into the PDF template at document generation time;
- **Captain Signature Integration:** The document generation process supports the inclusion of the barangay captain's digital signature representation in the appropriate location on each certificate;
- **Barangay Information:** Standard barangay details (name, municipality, province, LGU codes) are pre-configured and automatically applied to all generated documents.

---

# CHAPTER 4
## METHODOLOGY

### 4.1 Research Design

This study adopted a **developmental research design**, which is characterized by the systematic process of designing, developing, evaluating, and validating an artifact — in this case, a web-based information management system — that addresses a defined practical problem. The developmental approach is appropriate for studies that produce a technological product as their primary output, as it emphasizes iterative improvement, stakeholder involvement, and empirical evaluation as integral components of the research process.

The study began with a thorough analysis of the existing information management practices at Barangay Taruc, identifying key operational inefficiencies and articulating the functional requirements for the proposed system. This needs analysis phase was grounded in direct engagement with barangay staff and officials. The development phase then proceeded iteratively, with each increment of the system reviewed against the stated requirements before proceeding to the next development iteration. Upon completion of the system, a formal evaluation was conducted using the ISO 9126-1 software quality model, assessing the system across six quality characteristics: Functionality, Efficiency, Usability, Reliability, Maintainability, and Portability.

The study also employed **descriptive research methods** in the data gathering phase, using structured interviews and observational techniques to document current barangay processes and identify specific pain points that the system was designed to address.

### 4.2 Development Model

The **Rapid Application Development (RAD) model** was selected as the software development methodology for this project. RAD is characterized by its emphasis on iterative prototyping, rapid delivery of functional increments, close collaboration with end users, and continuous feedback integration throughout the development lifecycle. This approach was determined to be the most appropriate model for the Digital Profiling System given the following considerations:

- The system requirements, while comprehensive, were well-understood from barangay operations and could be defined with sufficient specificity to guide development;
- Early and frequent user feedback from barangay staff was essential to ensure that the system's design reflected actual operational workflows and user needs;
- The diversity of modules (fourteen distinct functional areas) necessitated a structured, incremental approach to development that allowed each module to be built, tested, and refined before integration with the broader system;
- The project timeline required efficient delivery of a functional system within the academic year, making the speed advantage of RAD methodology particularly relevant.

The RAD development model was implemented across four sequential phases:

#### Phase 1: System Analysis and Design

**Requirements Gathering**

A thorough analysis of barangay operations and profiling needs was conducted at the outset of the project. This involved structured observation of existing barangay administrative processes, review of sample documents and forms currently in use, and examination of existing record-keeping practices across each administrative function — including resident registration, document issuance, blotter recording, budget tracking, and disaster preparedness.

**Stakeholder Interviews**

Structured interviews were conducted with key stakeholders, including the Barangay Captain, Secretary, Treasurer, Kagawad members, and administrative staff. Through these interviews, the researchers gained a comprehensive understanding of the specific challenges faced by each role group. Key findings from stakeholder interviews included:

- Inefficient document processing workflows resulting in long wait times for residents requesting certifications;
- Difficulty in retrieving and updating resident and household data from paper logbooks and physical filing systems;
- Lack of a centralized or structured disaster preparedness tracking system, particularly for affected household profiling and evacuation monitoring;
- Scattered and inconsistent blotter records with no unified case status workflow or hearing schedule tracking;
- Manual budget recording without systematic transaction tracking or balance monitoring;
- Absence of any system for monitoring the status and progress of barangay programs and community projects;
- No standardized mechanism for maintaining health records or coordinating health program data.

**System Design**

Based on the analysis findings, a comprehensive system design was produced. This included:

- A system architecture diagram defining the relationships between the frontend, backend API, authentication layer, and database;
- A complete database schema designed in Prisma's schema definition language (SDL), covering all entities and their relationships across all fourteen modules;
- User interface wireframes and layout mockups for key pages including the dashboard, resident list, document request form, and disaster management interface;
- A role-permission matrix defining which operations each of the six user roles could perform across each module;
- A data flow diagram illustrating how information moves through the system for key use cases such as document request processing and disaster event management.

**Technology Selection**

Following the requirements and design phases, the technology stack was formally selected and justified:

- **Next.js 16:** React framework with App Router for unified full-stack development, server-side rendering, and built-in API routes;
- **TypeScript:** Type safety and enhanced developer productivity across the full codebase;
- **PostgreSQL:** Robust relational database for structured data storage with strong consistency and relational integrity;
- **Prisma ORM v7:** Type-safe database access, automated migration management, and expressive query API;
- **NextAuth.js v4:** Secure credentials-based authentication with JWT session management and role-based middleware;
- **Tailwind CSS v4:** Utility-first CSS framework for rapid, consistent, and responsive UI development;
- **shadcn/ui and Radix UI:** Accessible, customizable component library for consistent interface design;
- **Recharts:** React-native charting library for dashboard data visualizations;
- **Leaflet and react-leaflet:** Open-source interactive mapping for GIS household visualization;
- **pdf-lib:** Server-side programmatic PDF generation for barangay document certificates;
- **bcryptjs:** Password hashing for secure credential storage.

#### Phase 2: Development of the System

**Environment Setup**

The development environment was established by initializing the Next.js 16 project with the App Router architecture, configuring the TypeScript compiler with strict mode enabled, setting up the PostgreSQL database instance, configuring Prisma with the `@prisma/adapter-pg` driver adapter, and establishing version control with Git for collaborative development and change tracking.

**Database Design and Migration**

The complete database schema was implemented in Prisma's schema definition language and applied to the PostgreSQL database through Prisma's migration system. The schema defines the following primary data models with their relationships:

- `User` — Staff accounts with role enumeration and bcrypt-hashed passwords;
- `Purok` — Barangay subdivision units referenced by households;
- `Household` — Full household profiles with housing data and GPS coordinates;
- `Resident` — Comprehensive demographic data with government ID and classification fields;
- `DocumentRequest` — Document type, status workflow, control number, and PDF generation tracking;
- `Blotter` and `BlotterHearing` — Incident records and associated hearing schedule entries;
- `BarangayOfficial` — Officials directory with position, term, and photo data;
- `BudgetYear`, `BudgetAllocation`, and `BudgetTransaction` — Hierarchical budget tracking by year, category, and individual transaction;
- `Project` and `ProjectUpdate` — Community project records and progress history entries;
- `HealthRecord` — Resident health data by category;
- `DisasterEvent`, `HouseholdDisasterProfile`, `EvacuationCenter`, and `MissingPersonReport` — Full disaster management data with geographic and status fields.

Proper foreign key relationships, index configurations, and cascade delete behaviors were implemented to maintain data integrity and optimize query performance.

**Core Feature Development**

System development proceeded through eight structured iterations, each delivering a functional increment of the system:

- **Iteration 1 — Authentication and RBAC:** Implementation of NextAuth.js Credentials provider, login page, JWT session configuration, role-based middleware, and sidebar navigation with role-conditional visibility;
- **Iteration 2 — Resident and Household Profiling:** Full CRUD operations for residents and households, Philippine-specific demographic fields, purok linkage, search and filtering functionality, household member management, and CSV import capability;
- **Iteration 3 — Document Management:** Document request creation and management interface, twelve-document type support, status workflow implementation (Pending → Processing → Ready → Released), PDF generation with pdf-lib, control number assignment, and fee tracking;
- **Iteration 4 — Blotter and Officials:** Blotter incident recording with complaint classification and resident linkage, case status workflow implementation, hearing schedule management, and barangay officials directory with photo management;
- **Iteration 5 — Map and Dashboard:** Leaflet-based interactive GIS map with household coordinate plotting, analytics dashboard with Recharts visualizations (age distribution, sex ratio, purok population, civil status), and real-time summary statistic cards;
- **Iteration 6 — Disaster Preparedness:** Disaster event creation and status management, household disaster risk profiling, evacuation center management with map integration, missing persons reporting and tracking, and disaster-aware map overlay;
- **Iteration 7 — Health, Budget, and Projects:** Health records module with category-based data entry, budget management with multi-category allocation and transaction recording, and community projects monitoring with status tracking and update history;
- **Iteration 8 — Reports and Export:** CSV export functionality for residents, document records, disaster profiles, evacuation centers, and missing persons; report generation interface with configurable filters.

#### Phase 3: System Testing

A multi-layered testing strategy was implemented to validate system correctness, performance, and security:

- **Unit Testing:** Individual components, utility functions, and API handlers were tested in isolation to verify correct behavior under normal and edge-case conditions;
- **Integration Testing:** API endpoints were tested with realistic data payloads to verify correct interaction between the application layer and the PostgreSQL database, including validation of foreign key constraints, cascade behaviors, and authentication requirements;
- **User Acceptance Testing (UAT):** Testing sessions were conducted with barangay staff representing each user role, using real-world administrative scenarios (e.g., processing a document request from creation through PDF release, recording a blotter complaint and scheduling a hearing, creating a disaster event and profiling affected households) to validate that system behavior matched operational expectations;
- **Security Testing:** Authentication flows, middleware route protection, role-based access enforcement on API routes, and input validation were all systematically tested to identify and remediate potential security vulnerabilities;
- **Cross-Browser Testing:** System functionality was verified across major web browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari to ensure consistent behavior and visual presentation.

#### Phase 4: System Implementation

- **Deployment Preparation:** Production environment configuration including database provisioning, environment variable management (DATABASE_URL, NEXTAUTH_SECRET, and cloud storage credentials), build optimization, and deployment to a web hosting platform;
- **User Training Sessions:** Orientation and training sessions were conducted with barangay staff covering each module's features, data entry procedures, document workflow management, and disaster event protocols;
- **User Documentation:** System user guides were prepared covering module descriptions, step-by-step procedures for common tasks, and troubleshooting guidance for frequent user questions.

### 4.3 System Architecture

The system follows a three-tier web application architecture:

- **Presentation Tier:** React components rendered through Next.js, styled with Tailwind CSS v4 and shadcn/ui component library, displayed in the user's web browser. Pages that require user interaction (forms, tables with filters, map interfaces) are implemented as Client Components, while data display pages are implemented as Server Components where feasible;
- **Application Tier:** Next.js API routes (`src/app/api/`) serve as the RESTful backend, handling all business logic, input validation, authorization enforcement, PDF generation, and database operations. NextAuth.js manages the authentication middleware layer across all protected routes;
- **Data Tier:** PostgreSQL database accessed through the Prisma ORM singleton (`src/lib/prisma.ts`), which provides type-safe query construction and connection pool management via the `@prisma/adapter-pg` driver adapter.

The module routing structure follows the Next.js App Router convention, with each module accessible through a top-level route path:

| Route | Module |
|---|---|
| `/login` | Authentication |
| `/dashboard` | Analytics Dashboard |
| `/residents` | Resident Management |
| `/households` | Household Management |
| `/documents` | Document Issuance |
| `/blotter` | Blotter Recording |
| `/officials` | Officials Directory |
| `/budget` | Budget Management |
| `/projects` | Community Projects |
| `/health` | Health Records |
| `/disaster` | Disaster Management |
| `/map` | GIS Household Map |
| `/reports` | Reports and Export |
| `/settings` | Settings Management |

### 4.4 Data Gathering Procedure

Data for the needs analysis phase of the study was gathered through the following procedures:

**Direct Observation:** The researchers conducted observational visits to the Barangay Taruc hall to document current administrative workflows, observe staff interactions with paper-based records, and identify specific bottlenecks and pain points in day-to-day operations across each administrative function.

**Structured Interviews:** Semi-structured interview sessions were conducted with the Barangay Captain, Secretary, Treasurer, and selected Kagawad members. Interview questions were organized around five thematic areas: (1) current record-keeping methods and tools, (2) frequency and volume of document requests, (3) disaster preparedness and response processes, (4) budget management practices, and (5) key challenges and desired improvements in administrative operations.

**Document Review:** Existing paper documents used by the barangay — including sample barangay clearances, blotter record formats, budget ledger sheets, and project monitoring forms — were reviewed to inform the system's data model and document template design.

**Literature Review:** Academic literature and related system studies were reviewed to identify best practices in barangay information system design and to ensure that the system's features were grounded in evidence-based approaches to local government digital transformation.

For the system evaluation phase, data was collected through structured evaluation surveys administered to system evaluators using the ISO 9126-1 software quality criteria, with responses recorded on a five-point Likert scale for quantitative analysis.

### 4.5 Tools and Technologies

The following table summarizes the tools and technologies used in the development of the system:

| Tool / Technology | Category | Purpose |
|---|---|---|
| Next.js 16 (App Router) | Framework | Full-stack React framework; routing, SSR, API routes |
| TypeScript | Language | Type-safe development across the full stack |
| PostgreSQL | Database | Relational data storage and management |
| Prisma ORM v7 | ORM | Type-safe database access and migration management |
| @prisma/adapter-pg | DB Adapter | PostgreSQL driver adapter for Prisma v7 |
| NextAuth.js v4 | Authentication | Credentials provider, JWT sessions, RBAC middleware |
| bcryptjs | Security | Password hashing and verification |
| Tailwind CSS v4 | Styling | Utility-first CSS framework for responsive UI design |
| shadcn/ui | UI Components | Accessible, composable component library |
| Radix UI | UI Primitives | Accessible component primitives underlying shadcn/ui |
| Recharts | Data Visualization | Dashboard charts and statistical visualizations |
| Leaflet | Mapping | Open-source interactive GIS map rendering |
| react-leaflet | Mapping | React wrapper for Leaflet map integration |
| pdf-lib | PDF Generation | Server-side programmatic PDF certificate generation |
| Git | Version Control | Source code management and collaborative development |
| Visual Studio Code | IDE | Primary development environment |
| Vercel / Node.js | Deployment | Application hosting and runtime environment |

### 4.6 Database Design Summary

The database schema comprises seventeen primary data models organized across the system's fourteen functional modules. The following table summarizes the key models and their primary attributes:

| Model | Key Attributes | Relations |
|---|---|---|
| User | name, email, passwordHash, role | — |
| Purok | name, description | Household (1:N) |
| Household | houseNumber, address, gpsLat, gpsLng, housingType, is4Ps | Purok (N:1), Resident (1:N) |
| Resident | firstName, middleName, lastName, sex, dateOfBirth, civilStatus, education, employment, classifications, govtIds | Household (N:1) |
| DocumentRequest | type, status, controlNumber, purpose, fee, pdfPath | Resident (N:1) |
| Blotter | incidentDate, nature, complainant, respondent, status, narrative | BlotterHearing (1:N) |
| BlotterHearing | hearingDate, notes, outcome | Blotter (N:1) |
| BarangayOfficial | name, position, term, photoUrl | — |
| BudgetYear | year, totalBudget | BudgetAllocation (1:N) |
| BudgetAllocation | category, amount | BudgetYear (N:1), BudgetTransaction (1:N) |
| BudgetTransaction | description, amount, transactionDate | BudgetAllocation (N:1) |
| Project | title, description, status, startDate, endDate | ProjectUpdate (1:N) |
| HealthRecord | residentId, category, details, recordDate | Resident (N:1) |
| DisasterEvent | name, type, status, startDate | HouseholdDisasterProfile (1:N), MissingPersonReport (1:N) |
| HouseholdDisasterProfile | riskLevel, isEvacuated | Household (N:1), DisasterEvent (N:1), EvacuationCenter (N:1) |
| EvacuationCenter | name, address, capacity, gpsLat, gpsLng | HouseholdDisasterProfile (1:N) |
| MissingPersonReport | status, reportDate, foundDate | Resident (N:1), DisasterEvent (N:1) |

### 4.7 Ethical and Security Considerations

**Data Privacy Compliance**

The system is designed with awareness of the Philippine Data Privacy Act of 2012 (Republic Act No. 10173). Access to personal resident information is restricted to authorized barangay personnel through the role-based access control system. Sensitive fields such as health records, government ID numbers, and financial data are accessible only to roles with a demonstrated operational need.

**Role-Based Access Control**

The six defined user roles implement a principle of least privilege, ensuring that each role is granted access only to the modules and operations necessary for their specific administrative function. Role permissions are enforced at both the UI navigation level (via sidebar visibility) and the API route level (via server-side authorization checks), creating a defense-in-depth approach to access control.

**Password Security**

All user passwords are hashed using bcryptjs with a salt round configuration sufficient to resist brute-force attack approaches. Plaintext passwords are never stored in the database. The system's seed credentials are intended for controlled testing environments only and must be changed prior to production deployment.

**Session Security**

NextAuth.js JWT sessions are signed with a server-side secret (`NEXTAUTH_SECRET`) and stored in HTTP-only cookies, preventing client-side JavaScript access to session tokens and mitigating common session hijacking attacks.

**Input Validation**

All data submitted through the system's API routes is validated server-side before being processed or persisted to the database. Validation checks include type verification, required field presence, enumeration value membership, and reasonable value range constraints, reducing the risk of malformed data entry and potential injection attacks.

**Responsible Use of Community Data**

Barangay officials and staff are expected to use the system in accordance with their administrative mandate and in service of community welfare. The system's audit trail capabilities — including timestamped record creation and status change tracking — support accountability and responsible data stewardship.

---

# CHAPTER 5
## RESULTS AND DISCUSSION

### 5.1 Implementation Results

The Digital Residents for Pioneering and Information Management System for Barangay Taruc was successfully developed and deployed as a comprehensive, web-based platform covering all fourteen identified functional modules. The system was implemented using the full technology stack described in Chapter 3, and development proceeded through the eight iterative phases described in Chapter 4. This section presents the results of the implementation by describing each functional module as realized in the final system, including its route, interface components, key features, and the business rules governing its operation.

---

#### Figure 1. Login Page

**Route:** `/login`

The Login Page serves as the secure entry point to the system, providing credential-based authentication for authorized barangay staff. It presents a clean, professional interface that reflects the official nature of the system while remaining straightforward for users with varying levels of technical experience.

**Interface Components:**
- Barangay Taruc system logo and title banner at the top of the login form
- Email address input field with appropriate input type and placeholder text
- Password input field with a visibility toggle button (Eye / EyeOff icons) allowing the user to show or hide the entered password
- Login submission button with loading state indicator during authentication processing
- Error message display area for invalid credential feedback
- System branding footer indicating the official nature of the platform

**Key Features:**
- Email and password credential authentication via NextAuth.js Credentials provider
- Client-side form validation with immediate feedback on empty or malformed inputs
- Password visibility toggle enhancing usability for users who need to verify their typed credentials
- Secure server-side credential verification with bcryptjs password hash comparison
- JWT session token issuance upon successful authentication, stored in HTTP-only cookie
- Automatic role-based redirect after successful login, directing each user to the appropriate landing page for their role
- Middleware-enforced redirect of unauthenticated users attempting to access any protected route back to the login page

**Business Rules:**
- Only users with an existing account in the system database may log in; self-registration is not available
- Failed login attempts display a generic error message without revealing whether the email or password was incorrect
- Authenticated sessions persist across browser sessions until explicitly terminated or session expiry is reached
- Each authenticated session carries the user's role, which governs all subsequent access control decisions throughout the session

---

#### Figure 2. Analytics Dashboard

**Route:** `/dashboard`

The Analytics Dashboard is the primary landing page for authenticated users, presenting a real-time overview of key barangay statistics, demographic data, and operational indicators across all modules. It provides barangay officials and staff with an at-a-glance summary of community conditions and administrative activity.

**Interface Components:**
- Summary statistic cards displaying key population and service metrics
- Age distribution chart (bar/area chart segmented by age bracket and sex)
- Sex ratio chart (pie/donut chart)
- Population by purok chart (bar chart)
- Civil status distribution chart (bar or pie chart)
- Disaster preparedness section with household risk level distribution chart and active event display
- Active disaster event banner (displayed when a disaster event with ACTIVE status exists)
- Navigation sidebar with role-conditional module links

**Key Features:**
- Real-time summary statistics retrieved from the database on page load, including: total population count, total households, male and female resident counts, senior citizen count, persons with disability (PWD) count, 4Ps beneficiary count, solo parent count, registered voter count, OFW count, pending document request count, and active blotter record count
- Interactive Recharts visualizations rendering population data across multiple demographic dimensions
- Active disaster event detection with prominent display of the event name, type, and status when an ACTIVE disaster event exists in the system
- Disaster preparedness summary showing household risk level distribution (HIGH, MEDIUM, LOW, SAFE counts) and aggregate evacuation and missing persons figures
- Role-based sidebar navigation that conditionally renders module links based on the authenticated user's role

**Business Rules:**
- All statistics displayed on the dashboard reflect the current state of the database at the time of page load
- The active disaster event display is triggered only when at least one disaster event record with status ACTIVE exists in the system
- Dashboard statistics are read-only; no data entry or modification is performed from the dashboard
- All user roles have access to the dashboard, though the sidebar navigation links visible to each user are filtered according to their role's permission matrix

---

#### Figure 3. Resident Management

**Routes:** `/residents` (list), `/residents/new` (create), `/residents/[id]` (detail), `/residents/[id]/edit` (edit)

The Resident Management module is the core data module of the system, providing comprehensive tools for registering, viewing, updating, and managing the profiles of all barangay residents. It captures the full range of demographic, classification, and government-record information relevant to Philippine barangay administration.

**Interface Components:**
- Paginated resident list table with columns for name, age, sex, civil status, purok, and status
- Search input bar for filtering residents by name (first, middle, and last name)
- Filter controls for purok, sex, civil status, senior citizen status, PWD status, 4Ps membership, voter status, and other classification fields
- Add New Resident button navigating to the creation form
- Row-level action menu with options to view, edit, or delete a resident record
- CSV import button for bulk resident data upload
- Resident detail page displaying all profile data in organized sections
- Multi-section resident form (create/edit) covering all data fields

**Key Features:**
- Full CRUD operations (Create, Read, Update, Delete) for resident records with server-side validation on all fields
- Philippine-specific demographic fields including civil status variants (Single, Married, Widowed, Separated, Annulled, Live-in), religion, birthplace (municipality and province), and monthly income recorded as a string field to accommodate varied income representations
- Social welfare and classification fields: Senior Citizen flag, PWD flag with PWD type specification, 4Ps Beneficiary flag, Solo Parent flag, Indigenous People flag, OFW flag, and registered voter status
- Government ID reference fields: PhilHealth number, SSS number, Pag-IBIG number, TIN, and PhilSys National ID number
- Educational attainment and employment status fields
- Household linkage with relationship-to-household-head designation and purok assignment inherited through the household record
- Multi-criteria search and filtering supporting simultaneous filtering across name text search and multiple classification flags
- CSV import functionality allowing bulk upload of resident data from structured spreadsheet files
- Middle name inclusion in resident search queries for more precise name-based retrieval
- Soft-delete or permanent delete with confirmation dialog and cascade handling of linked records

**Business Rules:**
- A resident must be linked to a household at the time of registration, or linked subsequently; the purok assignment is derived from the linked household's purok
- If a resident is designated as the household head, this relationship is recorded and reflected in the household detail view
- Senior citizen classification is automatically considered when a resident's age reaches 60 years or older, though the flag may also be manually set
- Document requests, health records, blotter entries (as complainant or respondent), and disaster missing person reports may all be linked to a resident record; deletion of a resident triggers appropriate cascade or nullification behaviors on linked records
- The Secretary role has full read and write access to resident records; the Captain and Super Admin have full access; Kagawad and SK Chairman have read-only access; the Treasurer has read access for the purpose of indigency verification

---

#### Figure 4. Household Management

**Routes:** `/households` (list), `/households/new` (create), `/households/[id]` (detail), `/households/[id]/edit` (edit)

The Household Management module provides tools for creating, viewing, and managing the household units that form the geographic and social organizational structure of the barangay. Each household is linked to a purok, holds a set of resident members, and carries housing profile data relevant to social welfare programs and disaster preparedness.

**Interface Components:**
- Paginated household list table with columns for house number, address, purok, household head name, and member count
- Search input for filtering households by address or household head name
- Filter controls for purok and 4Ps designation
- Add New Household button
- Household detail page displaying full housing profile, linked purok, GPS coordinates, and member list
- Housing profile form section covering housing type, roof material, wall material, toilet type, and water source
- Resident member list with add/remove member functionality
- Delete Household button (role-restricted) with confirmation dialog
- Remove Household Member button (role-restricted) for removing individual residents from a household

**Key Features:**
- Full CRUD operations for household records with validation
- Purok assignment linking households to their geographic subdivision within the barangay
- GPS coordinate fields (latitude and longitude) that feed the GIS map module for household location plotting
- Housing profile data collection: housing type classification, roof material, wall material, toilet facility type, and water source type — data relevant to social welfare program targeting and disaster vulnerability assessment
- 4Ps (Pantawid Pamilyang Pilipino Program) beneficiary designation flag
- Resident member management with the ability to add residents to a household and designate the household head
- Member count display for quick population density assessment
- Delete Household functionality restricted to Super Admin and Captain roles, with cascade handling of linked resident household assignments
- Remove Household Member functionality restricted to appropriate roles, preserving the resident record while removing the household linkage

**Business Rules:**
- A household must be assigned to a purok; the purok assignment determines the household's geographic classification for dashboard and report purposes
- Each household may have at most one designated household head at any given time
- GPS coordinates, while not mandatory for record creation, are required for the household to appear as a marker on the GIS map
- Deleting a household does not delete the resident records linked to it; affected residents' household linkage is nullified upon household deletion
- Only the Super Admin and Captain roles may delete a household or remove a household member

---

#### Figure 5. Document Management

**Routes:** `/documents` (list), `/documents/new` (create), `/documents/[id]` (detail)

The Document Management module supports the full lifecycle of official barangay document requests, from initial filing through processing, PDF generation, and final release to the requesting resident. It implements a structured status workflow and automated PDF certificate generation for all twelve supported document types.

**Interface Components:**
- Paginated document request list table with columns for control number, document type, requesting resident, status badge, request date, and fee
- Filter controls for document type, status, and date range
- Add New Document Request button
- Document request creation form with resident search/selection, document type selector, purpose input, and fee entry
- Document detail page displaying all request information, status history, and generated PDF access
- Status update action buttons: Advance to Processing, Mark as Ready, Mark as Released, Reject, Cancel
- PDF generation and download button
- Status badge with color-coded visual indicators

**Key Features:**
- Support for twelve (12) official barangay document types: Barangay Clearance, Certificate of Indigency, Certificate of Residency, Business Permit Endorsement, Certificate of Good Moral Character, Barangay ID, First Time Job Seeker Certificate, Solo Parent Certificate, Cedula (Community Tax Certificate), SK Certification, Senior Citizen ID Endorsement, and PWD ID Endorsement
- Automated control number generation for each new document request, providing a unique identifier for tracking and accountability
- Programmatic PDF certificate generation using pdf-lib, pre-filling resident name, address, purpose, date of issuance, and barangay official details from the database
- Captain's digital signature representation integration in generated certificate PDFs
- Status workflow enforcement: requests progress through Pending → Processing → Ready → Released, with Rejected and Cancelled as terminal states accessible from appropriate workflow stages
- Filtering by document type, status, and date range to support document queue management
- Fee tracking per document request for financial record purposes
- Dashboard summary card displaying the current count of pending document requests

**Business Rules:**
- A document request must be linked to a registered resident in the system; walk-in requests for non-registered individuals cannot be processed without first creating a resident record
- Control numbers are assigned at the time of document request creation and cannot be modified subsequently
- The status workflow is strictly sequential; a document cannot be marked as Released without first passing through Pending, Processing, and Ready states — except for Rejected or Cancelled, which may be applied at any stage
- Only authorized roles (Secretary, Captain, Super Admin) may update document status or generate PDFs; Treasurer, Kagawad, and SK Chairman have read-only access to document records
- A Solo Parent Certificate may only be issued to residents classified as Solo Parents; similarly, Senior Citizen ID Endorsement requires the resident to be classified as a Senior Citizen, and PWD ID Endorsement requires PWD classification

---

#### Figure 6. Blotter Recording

**Routes:** `/blotter` (list), `/blotter/new` (create), `/blotter/[id]` (detail)

The Blotter Recording module provides a structured digital system for recording, tracking, and managing barangay incident reports and complaint cases. It replaces the traditional handwritten blotter logbook with a searchable, status-tracked digital record system.

**Interface Components:**
- Paginated blotter list table with columns for blotter number, incident date, nature of complaint, complainant name, respondent name, and case status badge
- Search input for filtering blotter records by complainant name, respondent name, or incident description
- Filter controls for case status and nature of complaint
- Add New Blotter Entry button
- Blotter creation form with incident details, complainant and respondent resident selection/entry, nature of complaint selector, and narrative text area
- Blotter detail page with full incident information and hearing schedule section
- Case status update controls
- Hearing schedule entry form for adding hearing dates and outcomes

**Key Features:**
- Structured incident recording with fields for incident date, location, nature of complaint (Assault, Theft, Trespassing, Noise Disturbance, Domestic Dispute, Property Damage, Estafa, Threat, Other), full narrative description, and complainant/respondent identification
- Complainant and respondent linkage to resident records where the parties are registered barangay residents, with provision for recording non-resident parties by name
- Case status workflow management: Filed → Under Mediation → Settled / Escalated / Closed / Withdrawn
- Hearing schedule logging with hearing date, presiding official notes, and outcome recording for each hearing session
- Dashboard active blotter count reflecting the number of cases currently in Filed or Under Mediation status
- Search and filter functionality for efficient case retrieval

**Business Rules:**
- All new blotter entries begin with a Filed status upon creation
- Cases may be escalated to the municipal or court level, changing status to Escalated as a terminal state within the barangay system
- Settled, Closed, and Withdrawn are terminal statuses indicating case resolution or withdrawal; no further status progression is permitted from these states
- Hearing entries may be added to a case at any active stage (Filed or Under Mediation) and are preserved as a permanent record of the case proceedings
- Secretary, Captain, Super Admin, and Kagawad roles have access to blotter records; the Kagawad role has read-only access

---

#### Figure 7. Barangay Officials Directory

**Route:** `/officials`

The Officials Directory module maintains a digital record of all incumbent and past barangay officials, providing a structured, searchable directory with portrait photo management capabilities.

**Interface Components:**
- Officials directory display, organized by position (Barangay Captain, Secretary, Treasurer, Kagawad members, SK Chairman, SK Councilors, etc.)
- Official profile cards displaying name, position, term dates, and portrait photo
- Add New Official button (role-restricted)
- Official creation/edit form with name, position, term start and end date fields, and photo upload functionality
- Photo management with cloud-based image storage integration
- Delete Official button with confirmation dialog (role-restricted)

**Key Features:**
- Structured directory of barangay officials organized by position and term
- Portrait photo management with image upload and cloud-based storage
- Term date tracking for historical record purposes
- Support for all standard barangay official positions: Captain, Vice Captain (Councilor), Secretary, Treasurer, Kagawad (Councilors), SK Chairman, and SK Councilors
- Full CRUD operations for official records with appropriate role-based access control

**Business Rules:**
- Photo uploads are stored in a cloud-based image storage service; only the image URL reference is stored in the database
- All authenticated users may view the officials directory; only Super Admin and Captain roles may create, edit, or delete official records
- Multiple officials of the same position may coexist in the record to support historical tracking of past officials alongside incumbent officials

---

#### Figure 8. Budget Management

**Routes:** `/budget` (budget overview and management)

The Budget Management module provides a structured digital system for planning, recording, and monitoring the barangay's annual budget — including fund allocation by category and individual expenditure transaction recording. It supports financial transparency and accountability within the barangay's internal administrative processes.

**Interface Components:**
- Budget year selector or list showing available budget years
- Budget summary view with total budget, total allocated, and total transactions by category
- Budget allocation table displaying categories (Personal Services, MOOE, Capital Outlay, Trust Fund) with allocated amounts and remaining balances
- Add New Budget Year form
- Budget allocation entry form for each category within a budget year
- Transaction list table with date, description, category, and amount columns
- Add Transaction button and form for recording individual expenditures or receipts

**Key Features:**
- Annual budget year creation and management, supporting multiple budget years for historical comparison
- Budget allocation by four standard categories: Personal Services (PS), Maintenance and Other Operating Expenses (MOOE), Capital Outlay (CO), and Trust Fund (TF)
- Individual transaction recording within each budget category, with description, date, and amount fields
- Real-time balance tracking showing the remaining unspent allocation per category based on recorded transactions
- Summary statistics displaying total budget, total allocated, total spent, and overall balance
- Budget year overview enabling year-over-year budget review

**Business Rules:**
- Budget management module access is restricted to Captain, Secretary, Treasurer, and Super Admin roles; Kagawad and SK Chairman do not have access to budget data
- Each budget year has a fixed set of allocation categories (PS, MOOE, CO, Trust Fund); allocations may be updated but not deleted once transactions have been recorded against them
- Budget transactions are for internal record-keeping purposes and do not constitute a formal Commission on Audit (COA) financial report
- The Treasurer role has full access to budget data; the Captain and Super Admin may also view and edit budget records; the Secretary may view budget records

---

#### Figure 9. Community Projects Monitoring

**Routes:** `/projects` (list and overview)

The Community Projects Monitoring module enables barangay administrators to create, track, and document the progress of community programs and barangay-funded projects throughout their implementation lifecycle.

**Interface Components:**
- Project list view with project title, status badge, start date, end date, and brief description
- Project status filter (Planned, Ongoing, Completed, Suspended, Cancelled)
- Add New Project button and creation form
- Project detail page with full project information, timeline data, and progress update history
- Add Project Update form for recording progress notes, milestone completions, and status changes
- Status update controls for advancing or changing project status

**Key Features:**
- Project record creation with title, description, funding source, start date, projected end date, and responsible official designation
- Project status lifecycle management: Planned → Ongoing → Completed, with Suspended and Cancelled as alternative states for projects that are interrupted or discontinued
- Progress update history logging, allowing multiple update entries to be added over a project's lifetime with date-stamped notes and milestone records
- Status-based filtering for quick identification of active, completed, and planned projects
- Project timeline tracking for monitoring adherence to planned schedules

**Business Rules:**
- Projects begin in Planned status and may be advanced to Ongoing upon commencement of implementation
- A project may be marked as Completed only when all planned activities have been documented as finished
- Suspended projects may be reactivated by returning them to Planned or Ongoing status; Cancelled projects are terminal
- All authenticated roles may view project records; Captain, Secretary, and Super Admin roles may create and update project records

---

#### Figure 10. Health Records

**Route:** `/health`

The Health Records module provides a basic digital documentation system for resident health data at the barangay level, supporting coordination with the municipal health office and the tracking of health program participation among barangay residents.

**Interface Components:**
- Health record list with resident name, health category, record date, and summary
- Resident search/filter for locating health records by resident name
- Health category filter (Senior Citizen, PWD, Maternal, Immunization, General)
- Add New Health Record button and form
- Health record detail view with full recorded data
- Resident linkage selector for associating records with registered residents

**Key Features:**
- Health record creation linked to registered barangay residents
- Category-based health data organization supporting senior citizen health monitoring, PWD health profiles, maternal health records, immunization tracking, and general health documentation
- Date-stamped records enabling longitudinal health data tracking per resident
- Search and filter functionality for efficient retrieval of health records by resident or category
- Role-based access control restricting health data access to authorized personnel

**Business Rules:**
- Health records are linked to registered resident profiles; a resident record must exist before a health record can be created for that individual
- Health record data is considered sensitive personal information; access is restricted to Captain, Secretary, and Super Admin roles
- The health records module is intended as a documentation and coordination tool, not as a clinical electronic medical record system; it does not replace formal health office records

---

#### Figure 11. Disaster Management

**Routes:** `/disaster` (disaster management hub)

The Disaster Management module provides a comprehensive digital platform for managing all aspects of barangay-level disaster preparedness and response operations. It integrates disaster event management, household risk profiling, evacuation center administration, missing persons tracking, and geographic map visualization into a unified operational interface.

**Interface Components:**
- Disaster event list with event name, type, status badge, and start date
- Create New Disaster Event button and form
- Active event selector for associating missing persons and household profiles with the current event
- Household disaster profile list showing household address, purok, risk level, evacuation status, and assigned evacuation center
- Add Household to Risk Profile button and form
- Evacuation center list with name, address, capacity, current occupancy, and GPS coordinate display
- Add Evacuation Center button and form (including "Add center here" functionality triggered by map click)
- Missing persons list with resident name, event association, report date, and status (Missing / Found)
- Report Missing Person button and Mark as Found button
- Disaster map view showing risk-colored household markers, evacuation center markers, and interactive click-to-add functionality
- Disaster event status update controls (ACTIVE, STANDDOWN, DRILL, ENDED)
- CSV export buttons for disaster profiles, evacuation centers, and missing persons data

**Key Features:**
- Disaster event creation and management supporting multiple disaster types (typhoon, flood, earthquake, fire, landslide, and others) with a defined status workflow: ACTIVE, STANDDOWN, DRILL, ENDED
- Active event context enabling association of household risk profiles and missing person reports with the specific disaster event in progress
- Household disaster risk profiling with four risk levels: HIGH, MEDIUM, LOW, SAFE — allowing officials to classify households by their geographic and structural vulnerability
- Evacuation tracking per household: marking households as evacuated and associating them with a specific evacuation center
- Evacuation center management with capacity tracking, address, and GPS coordinates for map display
- Missing persons report management with resident linkage, report date, event association, and found/unfound status
- Integrated disaster map overlay displaying risk-level-colored household markers (e.g., red for HIGH, orange for MEDIUM, yellow for LOW, green for SAFE) and evacuation center markers
- CSV export functionality for all three disaster sub-datasets (risk profiles, evacuation centers, missing persons) supporting external reporting and coordination

**Business Rules:**
- Only one disaster event may be set to ACTIVE status at any given time; setting a new event to ACTIVE should require confirmation if another event is already active
- Disaster risk levels (HIGH, MEDIUM, LOW, SAFE) are manually assigned by staff based on their assessment; the system does not automatically calculate risk levels
- A household must have GPS coordinates recorded to appear on the disaster map; households without coordinates are listed in the tabular views but cannot be plotted
- Missing person reports may only be created for registered barangay residents; missing non-residents must be handled through external means
- The ENDED status is a terminal state for a disaster event; records associated with ended events are preserved for historical reference
- Captain, Secretary, and Super Admin roles have full access to disaster management; Kagawad has read access

---

#### Figure 12. GIS Household Mapping

**Route:** `/map`

The GIS Household Mapping module provides an interactive geographic visualization of household locations across the barangay, plotting household GPS coordinates on an OpenStreetMap base layer using Leaflet. It supports both administrative planning and disaster preparedness operations.

**Interface Components:**
- Full-page interactive Leaflet map centered on Barangay Taruc, Socorro, Surigao del Norte
- Household markers plotted at recorded GPS coordinate positions
- Marker popup windows displaying household address, purok, household head name, and resident count on marker click
- Purok-based marker color coding or grouping for geographic distribution analysis
- Map zoom, pan, and full-screen controls
- Layer toggle controls for switching between standard household view and disaster risk overlay view

**Key Features:**
- Interactive OpenStreetMap base layer with satellite and topographic layer options where available
- Household location markers plotted from GPS latitude and longitude coordinates stored in each household record
- Marker popup information cards providing key household details without navigating away from the map
- Purok-based visual organization enabling geographic analysis of barangay settlement patterns
- Integration with disaster management data: when viewing the disaster map overlay, household markers are color-coded by risk level (HIGH, MEDIUM, LOW, SAFE) and evacuation center markers are displayed
- Click-to-add evacuation center functionality in the disaster map context, allowing staff to click any map location and open a form pre-filled with the clicked coordinates to register a new evacuation center

**Business Rules:**
- Only households with recorded GPS coordinates appear as markers on the map; the system displays the total count of households and the count of households with GPS coordinates to inform data completeness
- Map access is available to all authenticated roles
- The disaster risk overlay is linked to the active disaster event; switching disaster events updates the risk-level color coding displayed on the map

---

#### Figure 13. Reports and Export

**Route:** `/reports`

The Reports and Export module provides barangay administrators and authorized staff with tools for generating and exporting structured data reports in CSV format, supporting planning, auditing, and external coordination activities.

**Interface Components:**
- Report category selection panel listing available report types
- Filter and date range controls for scoping report data
- Generate/Export button for initiating CSV download
- Report preview table (where applicable) displaying a sample of the data to be exported
- Export status indicator

**Key Features:**
- CSV export functionality for multiple data categories: resident profiles, document request records, disaster risk profiles, evacuation centers, and missing persons reports
- Filter controls for scoping exports to specific puroks, date ranges, document types, disaster event associations, or other relevant dimensions
- Structured CSV output with properly labeled column headers for direct use in spreadsheet applications or submission to higher-level government offices
- Report generation for planning and administrative purposes, including population summaries and document activity summaries

**Business Rules:**
- Report and export access is available to Captain, Secretary, and Super Admin roles; data export is not available to Kagawad, Treasurer, or SK Chairman by default
- Exported CSV files contain only the data fields appropriate for the report type; sensitive fields such as government ID numbers may be excluded from general-purpose exports
- All export operations are server-side, ensuring that no unfiltered database access occurs through the export feature

---

#### Figure 14. Settings Management

**Route:** `/settings`

The Settings Management module provides Super Admin and authorized users with tools for configuring barangay-specific system settings, managing purok definitions, and administering user accounts within the system.

**Interface Components:**
- Settings navigation tabs: General Settings, Purok Management, User Accounts
- Purok list with add, edit, and delete controls
- Purok creation/edit form with name and description fields
- User account list table with name, email, role, and status columns
- Add New User form with name, email, password, and role assignment
- Edit User dialog with role change and name/email update capabilities
- Delete User button with confirmation dialog
- Role selector dropdown populated with the six available roles
- Barangay information fields (name, municipality, province) for configuring system-wide display settings

**Key Features:**
- Purok management enabling administrators to define, update, and remove the purok subdivisions used throughout the system for organizing households and residents
- User account creation with role assignment, enabling the addition of new staff accounts for incoming personnel
- User account editing supporting role changes, name updates, and email updates for existing accounts
- User account deletion with cascade handling for records associated with the deleted user
- Barangay configuration settings for system-wide display values such as barangay name, municipality, province, and captain name used in document generation

**Business Rules:**
- Settings management access is restricted exclusively to the Super Admin role; no other role may access the settings module
- A purok cannot be deleted while household records are assigned to it; the system enforces this constraint and returns an appropriate error message
- The system must always retain at least one Super Admin user account; deletion of the last Super Admin account is prevented
- Password changes for user accounts require entry of a new password; existing passwords are not displayed in plain text

---

### 5.2 System Evaluation

The system was evaluated based on the ISO 9126-1 international software quality standard, which defines six major quality characteristics: Functionality, Efficiency, Usability, Reliability, Maintainability, and Portability. Evaluation was conducted through structured evaluation instruments administered to system evaluators, with responses measured on a five-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree). Verbal description equivalents are: 4.50–5.00 = Outstanding; 3.50–4.49 = Very Satisfactory; 2.50–3.49 = Satisfactory; 1.50–2.49 = Fair; 1.00–1.49 = Poor.

#### A. Functionality

Functionality assesses whether the system provides the functions needed by its users and whether it meets its specified requirements.

| Criteria | Mean | Verbal Description |
|---|---|---|
| The system provides all required resident management functions (registration, search, update, delete) | | |
| The system correctly generates official barangay documents in PDF format with proper control numbers | | |
| The document status workflow (Pending → Processing → Ready → Released) functions as designed | | |
| The blotter module accurately records and tracks incident complaint cases with the correct status workflow | | |
| The budget management module correctly tracks fund allocations and transactions by category | | |
| The community projects module accurately records and displays project status and progress updates | | |
| The health records module correctly stores and retrieves resident health data | | |
| The disaster management module correctly tracks disaster events, risk profiles, and evacuation data | | |
| The GIS map correctly plots household locations based on recorded GPS coordinates | | |
| The role-based access control system correctly restricts module access according to user roles | | |
| The analytics dashboard correctly displays up-to-date statistics from the database | | |
| **Overall Mean for Functionality** | | |

#### B. Efficiency

Efficiency assesses the system's performance in terms of response time and resource consumption relative to the functions performed.

| Criteria | Mean | Verbal Description |
|---|---|---|
| The system responds to data retrieval requests (resident list, household list) within an acceptable time | | |
| PDF document generation is completed within an acceptable timeframe | | |
| The analytics dashboard statistics load promptly without noticeable delay | | |
| The GIS map loads and renders household markers efficiently | | |
| Search and filter operations return results quickly without excessive waiting | | |
| The system handles multiple simultaneous user sessions without significant performance degradation | | |
| CSV export operations complete within an acceptable time for typical data volumes | | |
| **Overall Mean for Efficiency** | | |

#### C. Usability

Usability assesses the ease with which users can learn, operate, and use the system to achieve their goals.

| Criteria | Mean | Verbal Description |
|---|---|---|
| The system interface is intuitive and easy to navigate for users with basic computer skills | | |
| Form labels, field descriptions, and placeholder texts clearly guide users during data entry | | |
| Error messages and validation feedback are clear, informative, and actionable | | |
| The sidebar navigation clearly indicates the current active module and available destinations | | |
| The system's workflow for processing a document request from creation to PDF release is straightforward | | |
| The disaster management interface provides clear guidance for managing emergency-related data | | |
| The GIS map interface is interactive and user-friendly for non-technical staff | | |
| The role-based interface correctly presents only the relevant features for each user's role | | |
| The overall visual design of the system is professional and appropriate for official government use | | |
| **Overall Mean for Usability** | | |

#### D. Reliability

Reliability assesses the system's ability to maintain its specified performance level under stated conditions for a stated period of time.

| Criteria | Mean | Verbal Description |
|---|---|---|
| The system consistently produces correct results for resident data retrieval operations | | |
| Document control numbers are always unique and correctly assigned upon document request creation | | |
| Status workflow transitions are reliably enforced and do not allow invalid state progressions | | |
| The system correctly enforces role-based access restrictions across all modules and API routes | | |
| Data entered by users is accurately and persistently stored in the database without loss | | |
| The system recovers gracefully from input errors without data corruption or system failure | | |
| Authentication sessions remain valid and secure throughout typical usage sessions | | |
| **Overall Mean for Reliability** | | |

#### E. Maintainability

Maintainability assesses the ease with which the system can be modified to correct defects, improve performance, or adapt to changes in requirements.

| Criteria | Mean | Verbal Description |
|---|---|---|
| The system's modular Next.js architecture makes it straightforward to add new features without disrupting existing functionality | | |
| The TypeScript codebase is well-typed and self-documenting, reducing the effort required to understand the code | | |
| The Prisma ORM migration system makes database schema changes manageable and trackable | | |
| The component-based UI architecture (shadcn/ui and Radix UI) allows UI modifications to be made efficiently | | |
| The separation between API routes and UI components enables independent maintenance of business logic and presentation | | |
| The system's code organization follows consistent conventions that facilitate future development | | |
| **Overall Mean for Maintainability** | | |

#### F. Portability

Portability assesses the ease with which the system can be transferred from one environment to another.

| Criteria | Mean | Verbal Description |
|---|---|---|
| The system operates correctly across major web browsers (Chrome, Firefox, Edge, Safari) | | |
| The system's responsive design allows it to be used on desktop computers and tablet devices | | |
| The system can be deployed to standard Node.js-compatible web hosting platforms with minimal configuration | | |
| The database schema and migration files allow the system to be set up on a new PostgreSQL instance reliably | | |
| Environment-specific configuration is properly isolated in environment variables, facilitating environment transitions | | |
| **Overall Mean for Portability** | | |

#### System Evaluation Summary

| Quality Characteristic | Overall Mean | Verbal Description |
|---|---|---|
| A. Functionality | | |
| B. Efficiency | | |
| C. Usability | | |
| D. Reliability | | |
| E. Maintainability | | |
| F. Portability | | |
| **Grand Mean** | | |

### 5.3 Key Achievements

The development and implementation of the Digital Residents for Pioneering and Information Management System for Barangay Taruc produced the following key achievements:

1. **Successful Development of a Comprehensive, Integrated Barangay Management Platform**
   - Fourteen functional modules were successfully designed, developed, tested, and integrated into a single web application
   - All modules are accessible through a unified interface with consistent navigation, styling, and user experience
   - The full development lifecycle — from requirements analysis through design, implementation, testing, and deployment — was completed within the academic project timeline

2. **Automation of Barangay Document Issuance**
   - Twelve distinct official barangay document types are supported with automated PDF generation
   - Control number assignment, status workflow enforcement, and PDF output eliminate manual certificate preparation
   - Processing time for document requests is significantly reduced compared to manual preparation methods
   - All generated documents include required resident details, barangay information, date of issuance, and captain signature representation

3. **Centralized Resident and Household Database**
   - All resident demographic, classification, and government ID data is stored in a structured, searchable database
   - Philippine-specific fields (civil status variants, social welfare classifications, government ID numbers) are fully supported
   - Multi-criteria search and filtering enable rapid resident record retrieval
   - CSV import functionality supports bulk data migration from existing spreadsheet records

4. **Integrated Disaster Preparedness and Response System**
   - Disaster events, household risk profiles, evacuation centers, and missing persons are managed within a unified disaster module
   - Risk-level visualization on the GIS map overlay provides geographic situational awareness during disaster events
   - CSV export functionality for disaster data enables efficient coordination with municipal and provincial disaster response offices

5. **Role-Based Access Control Across All Modules**
   - Six user roles (Super Admin, Captain, Secretary, Treasurer, Kagawad, SK Chairman) with distinct permission matrices are implemented and enforced at both the UI and API levels
   - Sensitive data is protected from unauthorized access through server-side authorization checks on all API routes
   - The system complies with the principle of least privilege, granting each role access only to the functions required for their administrative responsibilities

6. **Data-Driven Analytics and Visualization**
   - The analytics dashboard provides real-time population statistics and demographic visualizations
   - Recharts-powered charts for age distribution, sex ratio, purok population, and civil status distribution support evidence-based planning
   - Disaster preparedness risk level distributions and active event indicators are prominently displayed

### 5.4 System Advantages

**Elimination of Manual Paper-Based Processes**

The system replaces handwritten logbooks, paper filing systems, and manual typewritten certificates with a structured digital platform. This eliminates a broad class of errors associated with manual data handling — including illegible handwriting, transcription errors, filing misfires, and physical document loss — while substantially reducing the time required to locate, update, and report on resident records.

**Integrated Cross-Module Data Relationships**

Because resident profiles, household data, document requests, blotter entries, health records, and disaster profiles are all stored in a single relational database, information is shared across modules without redundant data entry. A resident registered in the system can have documents issued, blotter complaints linked, health records created, and disaster profiles assigned — all referencing the same underlying resident record. This relational integration reduces data inconsistency and ensures that updates to a resident's core profile are reflected across all modules.

**Secure, Role-Aware Access Control**

The six-role permission system ensures that sensitive data is accessible only to personnel with a legitimate operational need. Financial data is restricted to the Treasurer and senior officials; health records are accessible only to operational staff; settings management is exclusive to the Super Admin. This enforced separation of concern supports data privacy compliance and reduces the risk of unauthorized access or inadvertent data modification.

**Scalable and Maintainable Technology Architecture**

The use of Next.js, TypeScript, PostgreSQL, and Prisma ORM creates a technology foundation that is well-suited to long-term maintenance and future enhancement. TypeScript type safety reduces the likelihood of runtime errors as the system evolves; Prisma migrations provide a controlled mechanism for database schema evolution; the component-based UI architecture enables UI updates and new features to be added with minimal disruption to existing functionality.

**Support for Disaster Preparedness in a High-Risk Environment**

Given Surigao del Norte's geographic vulnerability to typhoons, flooding, and seismic events, the disaster management module provides a particularly critical capability. The ability to rapidly profile household risk levels, manage evacuation center assignments, and track missing persons within a digital system — with geographic visualization through the GIS map — provides a substantial improvement over the manual disaster response coordination methods previously available to the barangay.

**Open-Standards Technology Stack**

The system is built entirely on open-source and widely-adopted technology standards, minimizing licensing costs and ensuring long-term vendor independence. PostgreSQL, Next.js, Leaflet, and the other components of the technology stack are all freely available and supported by large, active developer communities.

### 5.5 Comparison with Traditional Methods

| Aspect | Traditional Method | Digital System | Improvement |
|---|---|---|---|
| Resident record creation | Manual handwriting in logbooks; filed in physical folders | Digital form entry with validation; stored in structured database | Eliminates illegible records and filing errors; enables instant retrieval |
| Document issuance | Manual typewriting of certificates; no standardized control numbers | Automated PDF generation with unique control numbers and pre-filled resident data | Reduces processing time from hours/days to minutes; ensures document consistency |
| Record retrieval | Physical search through filing cabinets or logbooks | Instant database search with multi-criteria filters | Record retrieval reduced from minutes/hours to seconds |
| Blotter recording | Handwritten logbook entries; no structured case status tracking | Digital case records with status workflow and hearing schedule management | Enables consistent case tracking and status monitoring across all cases |
| Budget tracking | Manual ledger books; high risk of arithmetic errors | Digital transaction recording with automatic balance calculation | Eliminates manual calculation errors; improves financial transparency |
| Project monitoring | Informal notes or separate documents | Structured project records with status lifecycle and progress update history | Enables systematic monitoring of all programs and projects |
| Disaster response | Phone calls and improvised lists | Digital event management, risk profiling, evacuation tracking, and missing persons reports with map visualization | Provides organized, geographic-aware disaster coordination capability |
| Household mapping | Paper maps and informal location knowledge | Interactive GIS map with GPS-plotted household markers | Provides accurate, visual geographic reference for planning and emergency response |
| Report generation | Manual tabulation from logbooks | Automated CSV export with configurable filters | Reduces report preparation from hours to seconds; improves accuracy |
| Data security | Physical documents susceptible to loss, damage, theft | Role-based access control, encrypted sessions, server-side validation | Substantially improved data confidentiality, integrity, and availability |
| Multi-user access | Single logbook shared sequentially | Concurrent multi-user access with role-based permissions | Multiple staff members can work simultaneously without access conflicts |

### 5.6 Limitations and Future Enhancements

**Current Limitations**

- The system is designed specifically for Barangay Taruc and requires configuration adjustments for deployment in other barangays, including purok definitions, barangay official details, and document template customization;
- Internet connectivity limitations in rural areas may affect system responsiveness; the system requires a stable internet connection and is not designed for offline operation;
- The system does not integrate in real time with national government databases (PhilSys, PhilHealth, SSS, GSIS) for identity or beneficiary record verification;
- The budget module is designed for internal tracking and does not produce COA-compliant financial reports;
- Mobile applications and SMS notification features are not included in the current implementation scope;
- The health records module provides basic documentation functionality and does not replicate the full capabilities of a dedicated clinical EMR system.

**Recommended Future Enhancements**

- **Offline Capability:** Development of progressive web app (PWA) features or a local caching strategy to enable core functionality during internet outages — particularly relevant for disaster response operations;
- **SMS and Email Notifications:** Integration with SMS gateway services and email APIs to send document status update notifications to residents and alert barangay staff to critical events;
- **National ID System Integration:** API integration with the Philippine Identification System (PhilSys) to enable real-time resident identity verification during document issuance;
- **Mobile-Optimized Interface:** Enhanced mobile responsive design and touch-optimized interaction patterns to support field data entry on smartphones and tablets during community visits or disaster response;
- **Advanced Analytics and Reporting:** Expanded dashboard capabilities including trend analysis over time, program effectiveness tracking, and exportable statistical reports in formats suitable for submission to municipal and provincial government offices;
- **Multi-Barangay Deployment:** Refactoring of barangay-specific configuration into a tenant-based multi-barangay architecture enabling the system to serve multiple barangays within a municipality from a single deployment;
- **Audit Logging:** Comprehensive audit trail functionality recording all data creation, modification, and deletion events with the responsible user identity and timestamp, supporting accountability and forensic review;
- **COA-Compliant Financial Reporting:** Enhancement of the budget module to produce financial reports aligned with Commission on Audit reporting standards;
- **Expanded Health Module:** Integration with barangay health worker workflows, immunization scheduling, and maternal health program tracking in alignment with Department of Health community health program requirements.

---

# CHAPTER 6
## SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS

### 6.1 Summary

This study designed, developed, and evaluated the **Digital Residents for Pioneering and Information Management System for Barangay Taruc** — a comprehensive, web-based information management platform developed to address the longstanding operational challenges faced by Barangay Taruc, Socorro, Surigao del Norte due to its reliance on manual and paper-based administrative processes.

The study was grounded in a review of related literature that consistently affirmed the value of digital information systems in improving local government administrative efficiency, data accuracy, service delivery quality, and community welfare across multiple functional domains. The literature identified specific areas of greatest benefit: resident and household profiling, document issuance automation, blotter case management, budget tracking, project monitoring, health records management, disaster preparedness, GIS mapping, and role-based access security — all of which became the functional core of the developed system.

The system was developed using the Rapid Application Development (RAD) methodology, proceeding through four phases: System Analysis and Design, System Development, System Testing, and System Implementation. The technology stack comprised Next.js 16 with the App Router, TypeScript, PostgreSQL, Prisma ORM v7, NextAuth.js v4, Tailwind CSS v4, shadcn/ui, Recharts, Leaflet with react-leaflet, pdf-lib, and bcryptjs. Development proceeded through eight iterative cycles, with each iteration delivering a functional module increment before advancing to the next.

The completed system encompasses fourteen functional modules: (1) User Authentication and Role-Based Access Control (6 defined roles), (2) Analytics Dashboard, (3) Resident Management, (4) Household Management, (5) Document Management (12 document types with PDF generation), (6) Blotter Recording, (7) Officials Directory, (8) Budget Management, (9) Community Projects Monitoring, (10) Health Records, (11) Disaster Management, (12) GIS Household Mapping, (13) Reports and Export, and (14) Settings Management. The system consolidates all of these administrative functions into a single, integrated platform with a consistent user interface and a unified relational database.

System evaluation was conducted using the ISO 9126-1 software quality model, assessing the system across six quality characteristics — Functionality, Efficiency, Usability, Reliability, Maintainability, and Portability — through structured evaluation instruments administered to system evaluators.

### 6.2 Conclusions

Based on the development process, implementation results, and system evaluation findings, the researchers draw the following conclusions:

1. **The system successfully addresses the identified operational gaps in Barangay Taruc's administrative processes.** The fourteen functional modules collectively replace the manual, paper-based methods previously used for resident record management, document issuance, blotter recording, budget tracking, project monitoring, health data management, and disaster preparedness coordination.

2. **The automated document generation feature significantly reduces the time and effort required for barangay document issuance.** By pre-filling resident and barangay data into properly formatted PDF certificates with unique control numbers, the system eliminates manual typewriting and reduces processing time from hours or days to a matter of minutes.

3. **The six-role access control system effectively enforces data privacy and operational security.** By implementing the principle of least privilege — granting each role access only to the modules and operations appropriate to their administrative function — the system ensures that sensitive community data is accessible only to authorized personnel, in alignment with the Philippine Data Privacy Act of 2012.

4. **The integrated relational database architecture enables cross-module data consistency without redundant data entry.** Because all modules reference a shared set of resident and household records, data entered once in the core profiling modules is available throughout the system without re-entry — reducing inconsistency and data duplication.

5. **The disaster management module provides a substantially improved capability for disaster preparedness and response in a geographically vulnerable barangay.** The combination of event management, household risk profiling, evacuation center tracking, missing persons management, and GIS map visualization represents a significant advancement over the informal, ad hoc disaster response coordination methods previously available to Barangay Taruc.

6. **The technology stack selected for the system — Next.js, TypeScript, PostgreSQL, Prisma, and associated libraries — proves suitable and effective for building a production-ready, maintainable barangay information system.** The use of TypeScript provides compile-time safety that reduces runtime errors; Prisma migrations enable controlled schema evolution; and the component-based UI architecture supports future feature additions with minimal disruption to existing functionality.

7. **The system demonstrates the feasibility and value of a holistic, integrated approach to barangay digital governance.** Rather than addressing individual administrative functions in isolation, a unified platform covering the full breadth of barangay operations delivers compounding benefits through shared data, consistent interfaces, and coordinated workflows — a finding that supports the direction called for in the reviewed literature.

8. **The system provides a replicable model for digital transformation in other barangays.** While configured specifically for Barangay Taruc, the system's modular architecture and technology stack make it adaptable for deployment in other barangays with minimal core code changes, requiring primarily reconfiguration of barangay-specific settings and data.

### 6.3 Recommendations

Based on the conclusions of this study, the researchers offer the following recommendations:

- **Conduct thorough user training for all barangay staff** covering all modules relevant to their role, with particular emphasis on document workflow management, disaster event operations, and budget transaction recording. Training should be conducted in sessions that allow hands-on practice with the system using realistic administrative scenarios before full production deployment;

- **Develop and implement a data migration plan** to transfer existing paper-based or spreadsheet records into the digital system in a structured, validated manner, ensuring that historical resident records, household data, and relevant historical documents are available in the system from day one of operational use;

- **Implement regular database backup procedures** in the production environment, including automated scheduled backups to an off-site or cloud storage location, to protect against data loss due to hardware failure or other unforeseen events;

- **Ensure that all production environment variables** (DATABASE_URL, NEXTAUTH_SECRET, cloud storage credentials) are properly secured and never exposed in source code repositories or publicly accessible locations;

- **Explore deployment on a reliable web hosting platform** (such as Vercel, Railway, or a managed server) with uptime guarantees appropriate for a public service system, and evaluate internet connectivity options at the barangay hall to ensure stable system access;

- **Consider phased enhancement of the system** in subsequent development cycles, prioritizing SMS notification integration, mobile optimization, and offline capability based on the specific operational priorities identified after the initial period of production use;

- **Replicate and adapt the system for neighboring barangays** in Socorro, Surigao del Norte, potentially leading to a shared municipal-level deployment that could facilitate cross-barangay data comparison and coordinated disaster response across the municipality;

- **Engage with the municipal government** to explore integration opportunities with municipal-level systems and to align the system's output formats with the data reporting requirements of higher-level local government units;

- **Conduct a follow-up evaluation study** after at least three to six months of production use by barangay staff, assessing actual operational performance, user adoption rates, and the quantified impact on service delivery times compared to the pre-digitalization baseline;

- **Document lessons learned from the implementation** and share findings with the academic community and with other local government units exploring similar digital transformation initiatives, contributing to the body of practical knowledge on e-governance in Philippine barangay administration.

---

## REFERENCES

David, A., Yigitcanlar, T., Li, R. Y. M., Corchado, J. M., Cheong, P. H., Mossberger, K., & Mehmood, R. (2023). Understanding Local Government Digital Technology Adoption Strategies: A PRISMA Review. *Sustainability, 15*(12), 9645. https://www.mdpi.com/2071-1050/15/12/9645

Imus, J. K. P., Magleo, E. D., Soriano, M. A. A., & Olalia, R. L. (2018). Barangay Management Information System (BMIS) for Cities and Municipalities in the Philippines. *International Journal of Computer Applications, 180*(19), 1–6. https://www.ijcaonline.org/archives/volume180/number19/29042-2018916441/

Lacasandile, A., Abisado, M. B., Labanan, R. M., & Abad, L. P. (2020). Development of an Information-Based Dashboard: Automation of Barangay Information Profiling System (BIPS) for Decision Support towards e-Governance. In *Proceedings of the 4th International Conference on E-Society, E-Education and E-Technology (ICSET '20)* (pp. 68–75). ACM. https://dl.acm.org/doi/10.1145/3421682.3421691

Bondoc, B. C. (2019). Towards Digitization through e-Barangay: A Web-based Barangay Information System. *International Journal of Humanities and Development (IJHED), 1*(2), 88–91. https://doi.org/10.22161/jhed.1.2.5

Melendres, U. M., & Aranda, K. M. (2024). Development and Evaluation of a Web-Based Resident Information Management System. *Journal of Computer, Software, and Program (JCSP), 1*(1), 14–22. https://doi.org/10.69739/jcsp.v1i1.50

Schoegje, T., de Vries, A. D., Hardman, L., & Pieters, T. (2023). Improving the Effectiveness and Efficiency of Web-Based Search Tasks for Policy Workers. *Information (MDPI), 14*(7), 371. https://www.mdpi.com/2078-2489/14/7/371

Li, X., Wang, L., & Fang, L. (2022). Optimal Design of an Information Management System for Government: A Bridge between Government and Citizens. *Mathematical Problems in Engineering (Hindawi), 2022,* Article 3127858. https://www.hindawi.com/journals/mpe/2022/3127858/

Gedorio, J. M. N., Naidas, B. M., Menor, M. G., & Ayuyang, R. (2023). Barangay Blotter and Clearance System of Sta. Maria, Gonzaga, Cagayan, Philippines. *Journal of Pure and Applied Sciences (Cagayan State University), 1*(1). https://csu.org.ph/jpas/article/view/23

Lorenzo, E. B., Paguio, D. P., & Asio, J. M. R. (2021). Budget Allocation System of a Highly Urbanized Local Government Unit in Central Luzon, Philippines. *International Journal of Humanities, Management and Social Science (IJ-HuMaSS), 4*(2), 51–62. https://www.researchgate.net/publication/367820659_Budget_Allocation_System_of_a_Highly_Urbanized_Local_Government_Unit_in_Central_Luzon_Philippines

Javellana, J. C., Cainong, J. J. D., & Galvez, D. D. L. (2015). An Integrated Information Management System for Barangay 1-A Davao: Profiling, Incident Recording, Project/Program Monitoring and Document Request. ResearchGate. https://www.researchgate.net/publication/314774122_An_Integrated_Information_Management_System_for_Barangay_1-A_Davao_Profiling_Incident_Recording_ProjectProgram_Monitoring_and_Document_Request

Ongkeko, A. M., Fernandez, R. G., Sylim, P. G., Amoranto, A. J. P., Ronquillo-Sy, M., Santos, A. D. F., Fabia, J. G., & Fernandez-Marcelo, P. H. (2016). Community Health Information and Tracking System (CHITS): Lessons from Eight Years Implementation of a Pioneer Electronic Medical Record System in the Philippines. *Acta Medica Philippina, 50*(4), 264–279. https://www.researchgate.net/publication/313893323_Community_Health_Information_and_Tracking_System_CHITS_Lessons_from_Eight_Years_Implementation_of_a_Pioneer_Electronic_Medical_Record_System_in_the_Philippines

Garcia, Y. M., Gonzales, D. B., & Paguio, M. A. C. (2016). Barangay Disaster Preparedness Monitoring Web Application System. *International Journal of Computer Applications, 149*(3), 1–6. https://www.ijcaonline.org/archives/volume149/number3/25975-2016911364/

Iglesias, G. (2010). Geographic Information Systems Technology in Local Governance and Economic Development. *PIDS Discussion Paper Series.* Philippine Institute for Development Studies. https://eaber.org/wp-content/uploads/2011/05/PIDS_Iglesias_2010.pdf

De La Serna, D. J. T., & Bringula, R. P. (2022). E-Barangay: A Framework for a Web-Based System for Local Communities and Its Usability. *International Journal of Electronic Government Research (IJEGR), 18*(1), 1–13. https://www.igi-global.com/article/e-barangay/288071

Cardos, N. C., Empal, Z. K., Gabriel, C. E., & Prudente, R. S. (2025). Evaluating the Impact of Role-Based Access Control and Data Privacy Measures on User Satisfaction and Security Compliance in the SEAIT OJT Evaluation and Feedback System. *International Journal of Innovative Science and Research Technology (IJISRT), 10*(5), 785–796. https://ijisrt.com/assets/upload/files/IJISRT25MAY565.pdf

---

## CURRICULUM VITAE

---

### Curriculum Vitae

**Personal Information**

| | |
|---|---|
| Name | Joaquino, Raizy-Maricole C. |
| Nickname | Ray2x |
| Age | 20 |
| Date of Birth | December 24, 2004 |
| Civil Status | Single |
| Religion | IFI |
| Place of Birth | Socorro, Surigao del Norte |
| Home Address | Barangay Rizal, Socorro, Surigao del Norte |
| Email Address | raizymariclejoaquino@gmail.com |
| Contact Number | 09095165230 |

**Educational Background**

| Level | School | Address |
|---|---|---|
| Elementary | Socorro Central Elementary School (SOCES) | Brgy. Navarro, Socorro, Surigao del Norte |
| High School | Socorro National High School (SOHNS) | Brgy. Taruc, Socorro, Surigao del Norte |
| Senior High School | Socorro National High School (SOHNS) | Brgy. Taruc, Socorro, Surigao del Norte |
| Tertiary | Bucas Grande Foundation College (BGFC) | Brgy. Taruc, Socorro, Surigao del Norte |

---

### Curriculum Vitae

**Personal Information**

| | |
|---|---|
| Name | Consigna, Rizalyn D. |
| Nickname | Inday |
| Age | 20 |
| Date of Birth | December 30, 2004 |
| Civil Status | Single |
| Religion | MECA |
| Place of Birth | Socorro, Surigao del Norte |
| Home Address | Barangay Salog, Socorro, Surigao del Norte |
| Email Address | consignarizalyn@gmail.com |
| Contact Number | 09356315262 |

**Educational Background**

| Level | School | Address |
|---|---|---|
| Elementary | Brgy. Salog Elementary School | Salog, Socorro, Surigao del Norte |
| High School | Atoyay N. Sering National High School | Socorro, Surigao del Norte |
| Senior High School | Atoyay N. Sering National High School | Socorro, Surigao del Norte |
| Tertiary | Bucas Grande Foundation College (BGFC) | Brgy. Taruc, Socorro, Surigao del Norte |

---

### Curriculum Vitae

**Personal Information**

| | |
|---|---|
| Name | Cubillanes, Kisha Mae D. |
| Nickname | Kisha |
| Age | 20 |
| Date of Birth | May 27, 2005 |
| Civil Status | Single |
| Religion | IFI |
| Place of Birth | Socorro, Surigao del Norte |
| Home Address | Barangay Taruc, Socorro, Surigao del Norte |
| Email Address | kishamaecubillanes@gmail.com |
| Contact Number | 09518155689 |

**Educational Background**

| Level | School | Address |
|---|---|---|
| Elementary | Don Albino Taruc Memorial Elementary School (DATMES) | Brgy. Taruc, Socorro, Surigao del Norte |
| High School | Socorro National High School (SOHNS) | Brgy. Taruc, Socorro, Surigao del Norte |
| Senior High School | Socorro National High School (SOHNS) | Brgy. Taruc, Socorro, Surigao del Norte |
| Tertiary | Bucas Grande Foundation College (BGFC) | Brgy. Taruc, Socorro, Surigao del Norte |

---

*Digital Residents for Pioneering and Information Management System for Barangay Taruc*
*Bucas Grande Foundation College, College of Information Technology*
*December 2025*
