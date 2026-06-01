
PASAKJA: A WEB-BASED COMMUNITY TRANSPORTATION BOOKING & DISPATCHING SYSTEM

______________________

An Undergraduate Thesis Proposal Presented to
The Faculty of College of Information Technology
Bucas Grande Foundation College
Socorro, Surigao del Norte

______________________

In Partial Fulfilment of the Requirements for the Degree
INFORMATION TECHNOLOGY 

JUDY-ANN P. PUNO
DAPHNIE DANE V. SUPERO
LEEROSE T. GUMA
 

2025
APPROVAL SHEET

This capstone Project entitled PASAKJA: A WEB-BASED COMMUNITY TRANSPORTATION BOOKING & DISPATCHING SYSTEM 
1.	Prepared and submitted by Researcher 1, Researcher 2, Researcher 3 
Has been examined and is recommended for approval and acceptance


_____________________________________________________________
Approved by the committee on oral Examination during proposal with a grade of __on May 30, 2026

______________
Chairman


_____________________               	 	   	 _______________
		Member				         		Member

			       Rhea Jean Belsondra, MIT
			Dean, College of information Technology

ACCEPTED in partial fulfillment of the degree Diploma Information Technology.
TABLE OF CONTENTS

Title										Page
APPROVAL SHEET							    i	
ACKNOWLEDGEMENT							    ii	
TABLE OF CONTENTS							   iii	  
CHAPTER
a.	INTRODUCTION                                                                                5
Project Context                                                                                       5
Purpose and Description                                                                        6
Research Objectives                                                                               6                                                                     
Scope and Limitations of the project                                                     7
Significance of the Study                                                                       8
b.	REVIEW OF RELATED LITERATURE                                         9
Synthesis                                                                                                11
c.	TECHNICAL BACKGROUND                                                         12
d.	METHODOLOGY                                                                              18
e.	RESULTS AND DISCUSSION                                                          29 
f.	CONCLUSION AND RECOMMENDATIONS                               54
Conclusion                                                                                             54
Challenges Overcome                                                                            56
System Validation                                                                                  57
Research Contributions                                                                          57
Overall Assessment                                                                                58
Recommendation                                                                                   59
Final Thoughts                                                                                       66
References                                                                                 		   68 
CURRICULUM VITAE                                                                                 69
                                      
   

























ACKNOWLEDGEMENT

The researchers would like to express their sincere gratitude to all individuals and institutions who contributed to the success of this study.
First and foremost, we thank our Almighty God for granting us the strength, wisdom, and perseverance throughout the course of our research.
Our heartfelt appreciation goes to our research adviser, for his invaluable guidance, encouragement, and constructive feedback, which greatly improved the quality of our work. And also we are deeply grateful to the Dean of the College of Information Technology.
I am also thankful to my CO Researcher’s for their assistance and encouragement. Lastly, we dedicate this work to our families and loved ones for their unwavering support, understanding, and patience.
Thank you all for being part of this meaningful journey.



						Researcher 1
		 	  	    Researcher 2
		   		         Researcher 3







Chapter 1
INTRODUCTION
Transportation plays an important role in our community by helping people move to their destination safely and quickly. As our technology improves, transportation services became modern and convenient. However, many communities here in Philippines especially in our community still face problems such as difficulty in finding rides – wasting our time on waiting, missing trips, unclear fare prices, and the lack of security. Drivers also experience challenges on looking for passengers, monitoring their income, uneven earnings, and a lack of organized dispatching. 
Adekola et al. (2021) studied how road transport ticket booking can be moved from manual, counter-based systems to an online platform. Traditionally, passengers had to book tickets in person at transport terminals, which caused long wait times and other problems. The researchers proposed a web-based booking system that lets travelers and transport employees buy and sell tickets online, improving convenience and reducing delays. They also discussed challenges users and administrators face and suggested ways to successfully build and use the system. The system was developed using PHP, HTML, CSS, JavaScript, and a MySQL database. This online booking portal could support future improvements, such as better connections between transport users and companies.
Moreover, according to Dexter (2025) that studied how local systems and services can be improved through technology-based solutions, focusing on student-led capstone projects that address practical problems in communities. Traditionally, many operations relied on manual processes, paper records, and in-person interactions, which caused inefficiencies and delays. The researcher proposed various digital solutions, including web-based management systems, mobile applications, and automation tools, to improve accessibility, operational efficiency, and user experience. The study also highlighted common challenges in system development, such as user adoption, interface design, and technical limitations, and suggested strategies for successful implementation. And to create functional and interactive platforms, supporting future improvements in education, transportation, and community services.
	  In response to these needs, this study proposes “Pasakja: A Web-based Community Transportation Booking & Dispatching System.” The system is designed to connect passengers, drivers, and administrators through a centralized web platform that simplifies ride booking, dispatching, monitoring, and management within our community. It provides a simple and reliable way for passengers to book rides using their phones. At the same time, it gives drivers an organized system for receiving bookings and navigating to their destinations. It uses modern technology such as GPS, real-time tracking, and online payment options to improve the whole riding experience.
Project Context
           Pasakja is a web-based system developed to improve the process of booking and managing transportation services. The system uses GPS technology to allow passengers to book rides and track drivers in real time. It also supports automatic fare computation and multiple payment options, including cash and online payments.
The system is composed of three main user groups: passengers, drivers, and administrators. Each user group has specific functions that help improve transportation efficiency, safety, and management. Optional features such as shared rides and an SOS button are included to enhance convenience and passenger safety.
Purpose and Description
           The purpose of developing Pasakja: A Web-Based Community Transportation Booking and Dispatching System is to improve the efficiency, accessibility, and reliability of transportation services within the community. The system aims to address common problems such as difficulty in booking rides, unclear fare calculation, delayed dispatching, and lack of real-time updates. Pasakja is designed to provide a digital platform that connects passengers, drivers, and administrators, allowing better coordination and smoother transportation operations.
Pasakja is a web-based system developed to manage transportation booking and dispatching processes in an organized and efficient manner. It serves as a centralized platform where passengers can request rides, drivers can receive and manage bookings, and administrators can monitor and control system operations. The system uses GPS technology to support accurate location tracking and navigation, ensuring timely and reliable transportation services, includes the following key features:
• Passenger Booking and Registration: Passengers can register easily and book rides using GPS-based location services.
• Automatic Fare Calculation and Payments: The system automatically calculates fares and allows payments through cash or online methods.
• Real-Time Tracking: Passengers can track drivers in real time for better safety and transparency.
• Trip Records and Ratings: The system stores trip history and allows passengers to rate drivers to maintain service quality.
• Driver Registration and Verification: Drivers are required to complete a verification process to ensure safety and reliability.
• Booking Notifications and Navigation: Drivers receive nearby booking requests and use GPS navigation to reach destinations.
• Earnings and Availability Management: Drivers can view earnings and set their availability schedules.
• Administrative Dashboard: Administrators can manage drivers, set fares and zones, view reports, analyze data, and send notifications.
• Safety Features: Optional features such as shared rides and an SOS button are included to enhance passenger safety.
Research Objectives
            The development of Pasakja: A Web-based Community Transportation Booking & Dispatching System is guided by a set of general and specific objectives aimed at improving Socorro, Surigao del Norte community transportation services through digital technology.
General Objectives
            The general objectives of this study are to enhance the efficiency and accessibility of community transportation services through the digitization and automation of ride booking and dispatching processes; to improve passenger convenience and satisfaction by providing a user-friendly online booking system with real-time tracking and transparent fare computation; to support drivers by enabling efficient ride allocation, availability management, and earnings monitoring; to assist administrators in managing transportation operations through dashboards, analytics, and reporting tools; to promote safety and reliability by incorporating driver verification, GPS tracking, and optional emergency features; and to ensure system quality, security, and reliability while adhering to established web system development standards.

Specific Objectives
            The study is generally aimed at developing a web-based community transportation booking and dispatching system that seeks to:
•	To design and implement a web-based platform that allows passengers to easily register and book rides online;
•	To develop an automated fare calculation system with support for cash and online payment methods;
•	To integrate real-time GPS tracking to allow passengers to monitor driver location during trips;
•	To create a driver module that enables verified drivers to receive nearby booking requests, set availability, navigate routes, and view earnings;
•	To develop an administrative dashboard for managing drivers, fare rates, service zones, reports, and system notifications;
•	To incorporate optional safety and efficiency features such as shared rides and an SOS emergency button;
•	To generate trip history, ratings, and system reports that automatically update for monitoring and decision-making;
•	To ensure data security, access control, and proper user authentication for passengers, drivers, and administrators;
•	To develop a system that to the standards such as ISO 9126 in terms of functionality, usability, reliability, efficiency, maintainability, portability, and accessibility.
Scope and Limitations of the Study
           This section defines what Pasakja: A Web-based Community Transportation Booking & Dispatching System is designed to accomplish and identifies the limitations and challenges that may be encountered during its development, implementation, and use.
Scope of the Study
•	Online Ride Booking: The system allows passengers to register and book transportation services through a web-based platform.
•	Fare Calculation and Payment: The system automatically computes fares and supports both cash and online payment methods.
•	Real-Time Tracking: GPS technology is used to enable passengers to track drivers in real time during trips.
•	Driver Management: The system supports driver registration and verification, booking notifications, availability settings, GPS navigation, and earnings monitoring.
•	Administrative Management: The system provides an admin dashboard for managing drivers, fare rates, service zones, reports, and notifications.
•	Trip Records and Ratings: The system stores trip history and allows passengers to rate drivers after each trip.
•	Optional Features: The study includes optional features such as shared rides and an SOS emergency button to enhance safety and service efficiency.
Limitations of the Study
•	The study is limited to a specific community here in Socorro, Surigao Del Norte, and the system is tested only among selected passengers, drivers, and administrators.
•	The system is web-based and requires a stable internet connection and GPS-enabled devices to function properly.
•	The study does not include the development of a native mobile application.
•	Budget, time, and technological resources may limit the scope and features of the system.
•	Online payment functionality depends on the availability and reliability of third-party payment service providers.
•	GCash / online payments: The system demonstrates GCash checkout using a PayMongo test account only; production use was not implemented or evaluated.
•	Legal / merchant requirements: Real GCash payouts and live transactions require an approved business (or duly registered sole proprietor) merchant account with the payment provider; this study does not claim compliance with or completion of those legal and commercial requirements.
•	Data privacy and security concerns may limit access to real operational data during system testing and evaluation.     
Significance of the Study
The relevance of this study is described from the following perspectives:
Passengers — Pasakja benefits passengers by providing a convenient and reliable way to book rides online. Features such as real-time driver tracking, automatic fare computation, multiple payment options, trip history, and driver ratings help improve passenger convenience, safety, and overall travel experience.
Drivers — Drivers benefit from the system through efficient ride request notifications, GPS navigation support, flexible availability settings, and access to earnings information. The system helps reduce idle time, improve trip management, and increase income opportunities.
Community Transportation Operators — The system assists operators by organizing transportation services through centralized booking, standardized fares, driver management, and operational reports. This improves service coordination, transparency, and overall efficiency.
Administrators — Administrators benefit from having a centralized dashboard that allows them to manage drivers, fares, service zones, and system reports. The analytics and monitoring features support better decision-making and service improvements.
Educational Institutions — The completion of this study contributes to the improvement of quality education by serving as a practical example of a real-world web-based system. It can be used as a reference project for students studying information technology, system development, and related fields.
Future Researchers — The study serves as a reference for future research related to web-based transportation systems, community mobility solutions, and digital service platforms. The system may be used as a basis for further studies and system enhancements.


   




CHAPTER 2
REVIEW OF RELATED LITERATURE / SYSTEMS
This chapter reviews existing literature and studies related to the development of Pasakja: A Web-based Community Transportation Booking & Dispatching System. It focuses on previous works and technologies involving web-based transportation systems, ride booking platforms, dispatching methods, GPS tracking, fare calculation, and online payment services. The purpose of this review is to identify useful ideas, features, and challenges from existing systems that can help guide the design of the proposed system. It also provides a foundation for understanding how the proposed system improves or differs from existing transportation solutions and supports the objectives of this study.
Ulay, D. A. L. L., Domingo, A. D. D., Beran, C. J. A., Lazarte, A. L. S., et al. (2025) developed and evaluated an internet-based mobile application designed to improve tricycle reservation systems in San Jose, Occidental Mindoro. The study explained how the system enables passengers to register, view available tricycles, and confirm bookings through a mobile interface. The findings revealed that the application reduces waiting time, improves communication between drivers and passengers, and minimizes inefficiencies associated with traditional manual booking methods. The researchers also emphasized that the app enhances operational efficiency by providing real-time updates and automated booking records.
This study supports the implementation of Pasakja, as the system provides a digital platform that allows users to conveniently book tricycle rides anytime and anywhere. By improving accessibility and user experience, Pasakja modernizes local transport service delivery while addressing the limitations of conventional booking practices.
Pizarro, Gumabay, and Gumarang (2025) developed and evaluated the TC-TRISSEA mobile application, designed to enhance the safety, satisfaction, and service quality of tricycle commuters in Tuguegarao City. The study explained that the app allows passengers to access driver profiles, track rides in real time, and provide feedback through a mobile interface. The findings revealed that the application significantly improved commuter safety, ensured proper fare payments, and promoted accountability among drivers. IT experts also rated the app as highly compliant with ISO 25010 software quality standards, confirming its usability and reliability.
As it demonstrates how mobile applications can improve local transport systems by addressing inefficiencies, enhancing user experience, and increasing commuter confidence in tricycle services – it shows that it is relevant to Pasakja.
Joyride Group, Inc. (2022) developed Joyride, a Philippine-based ride-hailing platform designed to modernize last-mile transportation by enabling passengers to book motorcycle taxis and tricycles through a mobile application. The system integrates real-time GPS tracking, automated fare computation, cashless payment through GCash and other digital wallets, and driver verification process that requires background checks and vehicle registration prior to onboarding. Joyride serves passengers in Metro Manila and key provincial areas, offering a safe and organized alternative to the conventional practice of flagging down tricycles and motorcycles on the street. The platform also provides trip history records, mutual driver and passenger rating systems, and in-app customer support to enhance service accountability and user confidence.
  This system is highly relevant to Pasakja as both platforms aim to modernize community-level transport services in the Philippine context. Pasakja draws from Joyride's approach to driver verification, cashless payment integration, real-time GPS tracking, and user rating systems. However, Pasakja extends these features by targeting community transport operators with a centralized web-based dispatching and booking management interface, allowing administrators to monitor and manage multiple transport operations simultaneously—a capability that consumer-oriented applications like Joyride do not offer.
  Angkas, Inc. (2023) operates Angkas, a motorcycle taxi booking platform that became one of the first Transport Network Vehicle Service (TNVS) applications to be officially regulated by the Land Transportation Franchising and Regulatory Board (LTFRB) in the Philippines. The platform allows passengers to book motorcycle taxi rides through a mobile application, with features including real-time driver tracking via GPS, automated fare calculation based on distance, mandatory helmet provisioning, and a two-way rating system for drivers and passengers. Angkas implements driver accreditation through background checks, driving skills assessments, and mandatory safety briefings to ensure service quality and passenger protection. The platform's booking interface provides passengers with estimated fares, driver information, and trip monitoring functionality both before and during the ride, contributing to a transparent and accountable service experience.
  This system is relevant to Pasakja as it demonstrates the critical role of driver accountability systems, transparent fare structures, and GPS-based real-time tracking in building a reliable and trustworthy community transportation platform.
  Pasakja incorporates similar mechanisms for driver management and fare estimation while extending the system to accommodate multiple vehicle types—including tricycles, motorcycles, and vans—and providing a web-based administrative interface for centralized community transportation operations management.
  Grab Holdings Inc. (2023) operates Grab, one of Southeast Asia's largest and most comprehensive super applications, offering transportation services across eight countries including the Philippines, Singapore, Malaysia, Indonesia, Vietnam, Thailand, Cambodia, and Myanmar. The Grab transport platform provides GrabCar, GrabBike, GrabTrike, and other vehicle-type-specific booking services through an intelligent algorithm-driven dispatching system that automatically matches passengers with nearby available drivers based on proximity, vehicle type, and estimated time of arrival. Key platform features include real-time GPS navigation, upfront fare estimation, multiple payment options encompassing both cash and GrabPay, safety tools such as an emergency SOS button and trip-sharing functionality, and a dual rating system for both drivers and passengers to sustain service quality across all transactions. Grab processes millions of transportation bookings daily across Southeast Asia, making it one of the most widely adopted digital transportation platforms in the region.
  This system is directly relevant to Pasakja as it illustrates the scalable design of a multi-modal, GPS-driven, and algorithmically dispatched transportation booking platform. Pasakja adopts core concepts from Grab's platform —including real-time GPS tracking, automated driver-passenger matching, fare estimation, and emergency SOS alert features—and adapts them to serve community-level transport needs. Unlike Grab, which operates at a large commercial scale across multiple countries, Pasakja focuses specifically on community transport management and provides administrators with direct oversight of drivers, bookings, and transport operations within a defined service area.
  Cramer and Krueger (2016) studied the disruptive impact of Uber's digital platform on the traditional taxi industry, focusing on how algorithmic driver-passenger matching, transparent fare pricing, and GPS navigation transformed the ride-hailing service model. The study found that Uber drivers achieved significantly higher vehicle utilization rates compared to conventional taxi drivers, attributed to the platform's efficient digital dispatching system that eliminates the for manual radio dispatch or physical queuing at taxi stands. The researchers further noted that Uber's standardized passenger and driver rating system promotes accountability and encourages consistent service quality, while the real-time GPS tracking feature provides both transparency and safety assurance for passengers. Cramer and Krueger concluded that Uber's success demonstrated how data-driven platforms can address long-standing inefficiencies in transportation services that manual and radio-dispatch systems had failed to resolve for decades.
  These findings provide foundational context for the design of Pasakja. The core platform principles established by Uber—automated dispatching, upfront fare computation, real-time GPS tracking, and a mutual accountability rating system—have since been adapted by numerous localized transportation applications, including Grab, Joyride, and Angkas in Southeast Asia and the Philippines. Pasakja applies these same evidence-based principles within a community transport setting, demonstrating how proven global ride-hailing innovations can be adapted to address the unique transportation needs and operational requirements of local communities.
According to Iliopoulou and Kepaptsoglou (2019) presented a comprehensive review of Intelligent Transportation Systems (ITS) and their application in public transportation management. The study explained that Transportation Management Systems (TMS) utilize information and communication technologies to support vehicle assignment, route planning, scheduling, and operational control. According to the authors, the integration of optimization techniques and real-time data improves decision-making in transport operations and enhances the overall efficiency of transportation services. The study further emphasized that organized transport management reduces congestion, minimizes service delays, and improves passenger satisfaction.
This literature is relevant to the Pasakja system because it applies similar ITS principles to manage different community transport modes such as tricycles, motorcycles, and vans. By systematically assigning vehicles to passengers and monitoring transport operations, Pasakja ensures timely service delivery and effective utilization of transport resources within the community.
Adekola et al. (2021) developed and evaluated a web-based online road transport booking system designed to replace traditional manual booking processes. The study described how the system allows passengers to register, select transport services, and confirm bookings through an online interface. The findings revealed that online booking systems significantly reduce passenger waiting time and eliminate the need for physical presence at booking stations. The researchers also highlighted that such systems improve operational efficiency by automating record-keeping and reducing human errors.
This study supports the implementation of Pasakja, as the system similarly provides a web-based platform that enables passengers to conveniently book community transport services. By allowing users to make reservations anytime and anywhere, Pasakja enhances accessibility, improves user experience, and modernizes local transport service delivery.
Furthermore, AbdelAziz et al. (2019) examined the use of Global Positioning System (GPS) technology in transportation systems to improve vehicle tracking and travel time estimation. The study explained that GPS-based tracking enables real-time monitoring of vehicle movement, which helps transport operators manage fleets more effectively. It also allows passengers to receive accurate information regarding vehicle location and estimated arrival time. The researchers emphasized that GPS integration improves route planning, reduces uncertainty in travel, and enhances transparency in transport services.
These findings are directly applicable to Pasakja, as the system incorporates GPS technology to track the real-time location of assigned vehicles. This feature allows passengers to monitor their rides while enabling drivers to navigate efficiently to pickup and drop-off locations. As a result, GPS integration in Pasakja improves reliability, safety, and overall service quality.
Moreover, Estrada-Esquivel et al. (2022) discussed the development of a smart web-based information system for urban transportation using Internet of Things (IoT) technologies. The study highlighted that web-based platforms provide continuous system access, real-time information updates, and improved interaction between passengers and transport operators. The authors noted that such systems enhance communication, reduce information gaps, and support better decision-making for both users and administrators.
The system is developed as a web-based information platform that connects passengers, drivers, and administrators. Through this platform, users can perform bookings, view trip information, monitor vehicle status, and manage transport operations efficiently – this study is relevant to Pasakja. The web-based nature of Pasakja ensures accessibility regardless of time and location.
Lastly, Barrera Hernandez et al. (2025) investigated adaptive dispatching and scheduling systems in public transportation. The study explained that intelligent dispatching mechanisms use real-time data, passenger demand, and vehicle availability to optimize vehicle allocation. The results showed that adaptive dispatching reduces service delays, improves response time, and enhances operational efficiency. The authors concluded that smart scheduling systems are essential for modern transport services, especially in areas with fluctuating demand.
This literature supports the design of Pasakja’s dispatching and scheduling feature. By automatically matching nearby drivers to passenger requests and generating efficient schedules, Pasakja ensures timely and reliable community transport services. The application of adaptive dispatching principles improves service quality and maximizes the utilization of available transport resources.
Synthesis
	The compilation of literature and studies presented in this chapter provides a comprehensive understanding of how technology transforms community transportation systems. The synthesis of these studies highlights a common theme: the integration of web-based platforms, GPS tracking, intelligent dispatching, and real-time information significantly enhances operational efficiency, service reliability, and user convenience. Across the reviewed research, it is evident that technology enables systematic vehicle management, streamlines booking processes, improves route planning, and facilitates seamless interaction between passengers, drivers, and administrators. Collectively, these findings underscore the importance of adopting technological solutions to create an accessible, efficient, and user-centered community transportation system, as exemplified by the design and development of Pasakja.
The reviewed literature shows that digital and intelligent technologies are increasingly being used to improve community and public transportation. Traditional manual transport processes often result in long waiting times, poor coordination, and limited access to services, while web-based and mobile-based systems offer faster, more organized, and more user-friendly transportation solutions. Local studies by Ulay et al. (2025) and Pizarro, Gumabay, and Gumarang (2025) show that digital reservation and monitoring systems for tricycles improve passenger convenience, safety, and communication between drivers and commuters. These studies confirm that features such as online booking, vehicle tracking, and access to driver information help increase passenger trust and satisfaction while reducing inefficiencies in local transport services. These findings support Pasakja's goal of modernizing community transportation through a web-based platform.
Philippine-based commercial platforms further support these results. Joyride Group, Inc. (2022) and Angkas, Inc. (2023) demonstrate that locally-contextualized ride-hailing platforms with GPS tracking, cashless payments, and driver verification can be successfully adopted in Philippine communities. Grab Holdings Inc. (2023) provides an even larger-scale example of multi-modal, algorithmically-dispatched transportation, with features such as SOS alerts and dual rating systems. These platforms validate the feature set implemented in Pasakja and confirm the relevance of such capabilities for community-level transport services.
International studies provide additional foundational support. Cramer and Krueger (2016) established that data-driven, digitally dispatched platforms outperform manual radio-dispatch systems in vehicle utilization, service quality, and accountability — principles that Pasakja directly applies. Iliopoulou and Kepaptsoglou (2019) emphasize the role of Intelligent Transportation Systems in improving vehicle assignment, scheduling, and routing using real-time data. Similarly, Barrera Hernandez et al. (2025) highlight that adaptive dispatching and smart scheduling reduce delays and improve service response. In addition, Adekola et al. (2021) confirm that web-based booking systems reduce waiting time and remove the need for physical booking locations, while AbdelAziz et al. (2019) show that GPS tracking improves route planning, transparency, and reliability. Estrada-Esquivel et al. (2022) also stress the importance of web-based information systems for real-time updates and effective communication.
Altogether, these studies indicate that combining online booking, intelligent dispatching, GPS tracking, and real-time information systems leads to a more efficient and user-centered transportation service. Pasakja builds on these concepts to improve community-based transport services. The studies of Ulay et al. (2025) and Pizarro, Gumabay, and Gumarang (2025) are the most closely related to Pasakja due to their shared Philippine context and focus on community-level tricycle and ride-hailing services.











Chapter 3
TECHNICAL BACKGROUND
This chapter presents the technologies, frameworks, and tools used in the development of Pasakja: A Web-based Community Transportation Booking & Dispatching System. Each technology was selected to support the system's goals of reliability, scalability, security, and ease of use.
Frontend Technologies
Next.js (App Router)
Next.js is a React-based framework for building full-stack web applications. The App Router architecture provides file-based routing, server components, and optimized performance through server-side rendering (SSR) and static generation. Next.js was selected for Pasakja because it supports both server-rendered dynamic pages and API routes within a single codebase, making it well-suited for a multi-role platform that requires role-based navigation, real-time data, and secure API handling.
TypeScript
TypeScript is a typed superset of JavaScript that adds static type checking to the development process. It improves code quality, reduces runtime errors, and enhances developer productivity through better IDE tooling and refactoring capabilities. TypeScript is used throughout the Pasakja codebase to ensure that data models — such as bookings, drivers, and passengers — are consistently handled with type safety across all components and API routes.
Tailwind CSS and shadcn/ui
Tailwind CSS is a utility-first CSS framework that enables rapid, responsive user interface development. It is used alongside shadcn/ui, a collection of accessible and reusable components built on Radix UI primitives. Components such as Card, Button, Input, Table, Dialog, Badge, and Select are used across the Pasakja interface to provide a consistent, professional, and accessible experience for all user roles — passengers, drivers, and administrators.
Backend and Database
Node.js
Node.js is the JavaScript runtime that powers the Next.js server layer. It enables server-side execution of business logic, booking operations, API route handling, and database interactions. Node.js supports non-blocking I/O operations, making it suitable for handling concurrent booking requests from multiple users simultaneously.
PostgreSQL
PostgreSQL is a robust, open-source relational database management system. It supports ACID transactions, foreign key constraints, and complex relational queries. PostgreSQL was chosen for Pasakja because the system's data model — which includes interconnected entities such as users, bookings, trips, drivers, passengers, earnings, and zones — requires a reliable relational database that enforces data integrity and supports complex reporting queries.
Prisma ORM
Prisma is an Object-Relational Mapping (ORM) tool for Node.js and TypeScript. It provides a type-safe database client, declarative schema definitions, and migration support. In Pasakja, Prisma manages all database operations, from passenger registration and booking creation to driver availability updates and earning records. Prisma's type-safe client ensures that database queries are consistent with the defined schema, reducing the risk of runtime data errors.
Authentication and Security
NextAuth (Credentials Provider)
NextAuth provides authentication for Next.js applications using a Credentials provider for username and password login. JWT-based sessions store the authenticated user's identity and role without requiring a database query on every request. NextAuth is integrated with role-aware redirection so that passengers, drivers, and administrators are each directed to their respective dashboards upon login. All non-public routes are protected by middleware that verifies the session before rendering.
Secure Password Hashing
User passwords in Pasakja are hashed using a secure one-way hashing algorithm before being stored in the database. Plain-text passwords are never persisted. This ensures that even in the event of unauthorized database access, user credentials remain protected.
Zod Validation
Zod is a TypeScript-first schema validation library used to validate all API inputs and form submissions in Pasakja. By defining strict validation schemas for booking requests, user registration, driver profiles, and fare calculations, the system prevents invalid or malicious data from entering the database and ensures consistent data integrity across all operations.
Media and Payment Integration
Cloudinary
Cloudinary is a cloud-based media management platform used in Pasakja for storing and serving driver and passenger profile images. When a user uploads a profile photo, it is sent to Cloudinary's API, which returns a secure URL that is stored in the database. This approach removes the need to store image files locally on the server and provides reliable, globally distributed image delivery.
PayMongo
PayMongo is a Philippine payment gateway that enables online payments for local businesses and applications. Pasakja integrates PayMongo to support GCash and card-based payments for ride bookings. The integration uses PayMongo's Payment Intent API to initiate and confirm transactions. During this study, the system operates using a PayMongo test account; production payment processing requires a verified merchant account and is identified as a future implementation step.
Geolocation and GPS
Browser Geolocation API
The Browser Geolocation API is a standard web interface that allows web applications to request the user's current geographic coordinates from their device. Pasakja uses this API to capture the passenger's pickup location and the driver's current position, enabling GPS-based ride booking and location-aware dispatching. All location data is stored in the database as latitude and longitude coordinates and is used for fare computation and trip navigation.





Chapter 4
METHODOLOGY
4.1 Research Design
This study uses a developmental and applied systems design approach focused on planning, implementing, and evaluating a web-based transportation booking and dispatching platform for community use. The project follows an iterative development model, where core modules are built, tested, and refined based on functional requirements and role-based workflows.
4.2 Development Model
The project follows iterative phases:
1.	Requirements Analysis 
Identify user roles, process pain points, and system requirements for passengers, drivers, and administrators.
2.	System Design
Define architecture, database schema, access control rules, and UI flow.
3.	Implementation
Develop modules using Next.js, PostgreSQL, Prisma ORM, shadcn UI, and NextAuth-based authentication.
4.	Testing and Validation
Validate role-based behaviors, booking lifecycle updates, and data consistency.
5.	Deployment and Documentation
Prepare production-ready configuration and technical/user documentation.
4.3 System Architecture (Implemented)
The implemented system uses a modern web architecture:
•	Frontend: Next.js App Router with TypeScript and shadcn UI components.
•	Backend/API: Next.js server routes for booking, registration, driver/admin operations, and SOS handling.
•	Database: PostgreSQL with Prisma schema and normalized role-based entities.
•	Authentication: NextAuth with credential-based login and role-aware redirection.
•	Access Control: Passenger, Driver, and Admin dashboards with protected routes.
4.4 Data Gathering Procedure
Data gathering for system requirements was based on:
•	Observed local transportation flow and common user concerns;
•	Stakeholder-oriented feature mapping (passenger, driver, admin); and
•	Capability alignment with community constraints (web-based, GPS-ready workflows, practical payment options).
4.5 Tools and Technologies
Technology	Purpose
Next.js (App Router)	Full-stack web framework
TypeScript	Type-safe development
PostgreSQL	Relational database
Prisma ORM	Database access and migrations
NextAuth	Authentication and session management
Tailwind CSS + shadcn UI	User interface components
Cloudinary	Profile image storage and delivery
PayMongo	Online payment processing (GCash)
Browser Geolocation API	GPS location capture
Zod	Input validation
4.6 Database Design Summary
The data model includes key entities:
•	User — base identity and role (Passenger, Driver, Admin)
•	Passenger, Driver, Admin — role-specific profile data
•	Booking — ride request with pickup/dropoff, status, fare, and payment info
•	Trip — active trip record linked to a completed booking
•	Rating — post-trip rating by passenger for driver
•	Earning — driver earning record per completed trip
•	Zone, Fare — geographic zones and associated fare rates
•	Notification — system messages per user
•	SosAlert — emergency alert submitted by passenger
This model supports booking lifecycle management, financial tracking, service quality scoring, administrative monitoring, and emergency handling.
4.7 Ethical and Security Considerations
The system adopts role-based authentication, controlled access to dashboards, and secure password hashing. Operational records are stored for transparency and accountability. Data privacy and minimal exposure of user details are considered in route-level and module-level design.
________________________________________












Chapter 5
RESULTS AND DISCUSSION
Implementation Results and System Evaluation
This chapter presents the outcomes and achievements of Pasakja: A Web-based Community Transportation Booking & Dispatching System developed for the community of Socorro, Surigao del Norte. It assesses the system's effectiveness, accuracy, and efficiency in managing transportation bookings through GPS-assisted ride booking, role-based access control, automated fare computation, and real-time dispatch workflows. Key results obtained during implementation, deployment, and evaluation are discussed below.
Implementation Results
This section summarizes what was built and demonstrated in the working system. The application is a web-based solution using Next.js (App Router), TypeScript, PostgreSQL, Prisma ORM, NextAuth (credentials provider with JWT sessions), Tailwind CSS v4, shadcn/ui, Zod validation, Cloudinary (profile image management), and PayMongo (GCash/online payment integration). The system serves three distinct user roles — Passenger, Driver, and Administrator — each with a dedicated, role-protected dashboard and module set.
Please refer to the Appendices for sample inputs/outputs, screenshots of all user interfaces, and demo credentials.
________________________________________
Landing Page Interface
Figure 1. Pasakja System Home Page
 
Route: /
The landing page serves as the public entry point to the Pasakja system. It presents the system name, tagline, and a summary of key features available to community members. The page is accessible to all visitors without requiring authentication and provides clear navigation to the Login and Register pages.
Interface Components:
•	Hero section with system name and call-to-action buttons (Get Started, Login)
•	Feature highlights: GPS-Based Booking, Real-Time Tracking, Auto Fare Calculation, Driver Verification, Quick Dispatching, Trip Ratings
•	System statistics display: Active Drivers, Happy Passengers, Completed Trips, Average Rating
•	Responsive layout compatible with mobile and desktop browsers
________________________________________
Authentication and Access Control
Figure 2. System Login Interface
 
Route: /login
The login page provides secure access to the Pasakja system for all registered users. Only users with valid credentials can enter their respective dashboards. NextAuth with a credentials provider and JWT sessions prevents unauthorized access and ensures consistent, role-aware session handling across all protected routes.
Key Features:
•	Email and password authentication
•	Show/hide password toggle for usability
•	Toast notification for invalid credentials
•	Automatic role-based redirection after login:
o	ADMIN → /admin
o	DRIVER → /driver
o	PASSENGER → /passenger
•	Middleware protection for all non-public routes
•	Clear error message display on failed login
Security Implementation:
•	Passwords hashed with bcryptjs (12 rounds)
•	JWT session strategy for stateless, scalable authentication
•	Protected dashboard layout; unauthenticated users redirected to /login
________________________________________
Figure 3. Registration Interface — Passenger and Driver
 
Route: /register
The registration page provides a tabbed interface that allows new users to register as either a Passenger or a Driver. Each tab collects role-specific information and validates inputs before submitting to the API.
Passenger Registration Fields:
•	Full name (required)
•	Email address (required, unique)
•	Phone number (required)
•	Password (required)
Driver Registration Fields:
•	Full name (required)
•	Email address (required, unique)
•	Phone number (required)
•	License number (required, unique)
•	Vehicle type (required)
•	Vehicle plate number (required)
•	Vehicle model (required)
•	Password (required)
Business Rules:
•	Duplicate email addresses are rejected
•	Drivers are registered with a PENDING status and must be verified by an administrator before they can accept bookings
•	Passengers are immediately active upon registration
________________________________________

Role-Based Navigation and Dashboard Layout
Figure 4. System Navigation Shell — Sidebar and Role Session
 
After login, users access a responsive sidebar navigation with role-filtered menu items. The sidebar displays the Pasakja logo and system name, the active route with highlighting, the user's avatar or profile image initials, their role badge, and a sign-out control.

Navigation Modules by Role:
Module	Route	Passenger	Driver	Admin
Dashboard	/passenger, /driver, /admin	✓	✓	✓
Book a Ride	/passenger/book	✓	—	—
My Trips	/passenger/trips	✓	—	—
Profile	/passenger/profile, /driver/profile	✓	✓	—
Emergency SOS	/passenger/sos	✓	—	—
Available Bookings	/driver/bookings	—	✓	—
Navigation	/driver/navigate	—	✓	—
My Earnings	/driver/earnings	—	✓	—
All Bookings	/admin/bookings	—	—	✓
Driver Management	/admin/drivers	—	—	✓
Passengers	/admin/passengers	—	—	✓
Fare & Zones	/admin/fares	—	—	✓
Reports	/admin/reports	—	—	✓
SOS Alerts	/admin/sos	—	—	✓
Settings	/admin/settings	—	—	✓
Each route is protected at the server level. Users who attempt to access a route outside their role are redirected to their own dashboard, even if the URL is entered manually.
________________________________________
Passenger Module
Passenger Dashboard
Figure 5. Passenger Dashboard Interface
 
Route: /passenger
The passenger dashboard provides an at-a-glance view of the user's transportation activity and serves as the central hub for passenger operations.
Interface Components:
•	Personalized welcome message with the passenger's first name
•	Active booking alert card — displayed prominently when a booking is Accepted, Picked Up, or In Progress, showing driver name, pickup/drop-off addresses, and current status badge
•	Statistics summary:
o	Total bookings
o	Completed trips
o	Active/pending bookings
•	Quick-action "Book a Ride" button linking to /passenger/book
•	Recent bookings list with status badges (Pending, Accepted, Picked Up, In Progress, Completed, Cancelled)
________________________________________

Book a Ride Interface
Figure 6. Ride Booking Interface
 Route: /passenger/book
The booking interface allows passengers to submit a new ride request using GPS location services. The system captures the passenger's current location as the default pickup point and allows a drop-off address to be entered.
Form Fields:
•	Pickup location (GPS coordinates captured via Browser Geolocation API; address auto-resolved)
•	Drop-off location (text address input)
•	Payment method (Cash or Online via GCash/PayMongo)
•	Shared ride option (toggle for cost-sharing)
•	Additional notes (optional)
Fare Estimation:
•	Quoted fare is calculated based on the selected service zone and the configured base fare and per-kilometer rate
•	Fare is displayed to the passenger before confirmation
Payment Flow:
•	Cash: Booking is submitted directly; payment is settled in person
•	Online (GCash): PayMongo Payment Intent is created; passenger is redirected to the GCash checkout page; upon completion, payment status is updated and the passenger is returned to the system via /passenger/payment/return
Business Rules:
•	GPS location capture requires browser permission
•	Booking is only submitted if all required fields pass Zod validation
•	A passenger may not have more than one active booking at a time
________________________________________
Trip History Interface
Figure 7. My Trips Interface
 
Route: /passenger/trips
The trip history page displays all bookings made by the logged-in passenger, ordered by most recent. Active bookings are highlighted with a border accent to draw attention.
Table / List Columns:
•	Booking status badge (Pending / Accepted / Picked Up / In Progress / Completed / Cancelled)
•	Pickup address
•	Drop-off address
•	Driver name and profile image (when assigned)
•	Fare amount
•	Payment method and status
•	Shared ride indicator
•	Date and time of booking
•	Rating submitted (if trip is completed and rated)
Booking Lifecycle Status Colors:
•	Active statuses (Accepted, Picked Up, In Progress): highlighted with primary color border
•	Completed: secondary muted styling
•	Cancelled: destructive/red styling
Passenger Profile Interface
Figure 8. Passenger Profile Interface
 
Route: /passenger/profile
The passenger profile page displays the logged-in passenger's account information and allows them to update their profile image.
Profile Information Displayed:
•	Profile image (with upload capability via Cloudinary)
•	Full name
•	Role badge (Passenger)
•	Email address
•	Phone number
•	Account registration date
•	Total trips completed
Profile Image Upload:
•	Passengers can upload a new profile photo directly from the profile page
•	Images are uploaded to Cloudinary and the secure URL is saved to the database
•	The page refreshes automatically after a successful upload to display the new image
________________________________________
Emergency SOS Interface
Figure 9. Emergency SOS Interface
 
Route: /passenger/sos
The SOS interface allows passengers to submit an emergency alert during or outside of a trip. It is accessible at all times from the passenger's navigation menu to ensure help is always reachable.
Key Features:
•	GPS coordinates are captured automatically via the Browser Geolocation API
•	Optional message field for describing the emergency
•	One-tap SOS submission button with loading state
•	Success confirmation screen displayed after alert is submitted
•	Alert is logged in the database and becomes visible to administrators on the Admin SOS Alerts page
Security and Reliability:
•	If GPS cannot be captured (permissions denied or unavailable), the system falls back to a default community coordinate to ensure the alert is still submitted
•	SOS alerts are stored with the passenger's identity, coordinates, timestamp, and message for admin review
________________________________________
Driver Module
Driver Dashboard
Figure 10. Driver Dashboard Interface
 
Route: /driver
The driver dashboard is the central hub for driver operations. It displays the driver's current status, availability state, key performance metrics, and a list of available bookings from nearby passengers.
Interface Components:
•	Personalized welcome message with driver's first name
•	Driver status badge: Verified / Pending / Suspended
o	Pending drivers see a notice that their account is awaiting admin verification
•	Availability toggle (Online / Offline) — only active for Verified drivers
•	Performance statistics:
o	Total trips completed
o	Average passenger rating (star display)
o	Total earnings (Philippine Peso)
•	Available bookings section — lists all PENDING bookings that have no assigned driver
•	Quick navigation links to Bookings, Earnings, and Navigate pages
Business Rules:
•	Only Verified drivers can toggle availability and see the available bookings list
•	Suspended drivers see a notice and cannot access booking or navigation features
________________________________________
Available Bookings Interface
Figure 11. Driver Bookings Interface
 
Route: /driver/bookings
The bookings page shows the driver their currently accepted and in-progress trips, as well as all available pending bookings they can accept.
Booking Card Information:
•	Passenger name and profile image
•	Pickup address
•	Drop-off address
•	Shared ride indicator
•	Payment method (Cash or Online)
•	Quoted fare amount
•	Any additional notes from the passenger
Trip Progression Actions:
•	Accept — Driver accepts a pending booking; booking status changes to Accepted
•	Picked Up — Driver marks the passenger as picked up; status changes to Picked Up
•	Start Trip — Status changes to In Progress
•	Complete Trip — Trip is completed; an Earning record is created; booking status changes to Completed
•	Cancel — Driver cancels the booking
Real-Time Refresh:
•	The page includes an automatic refresher component that periodically polls for new available bookings, ensuring drivers see new requests without manually reloading
________________________________________
Navigation Interface
Figure 12. Driver Navigation Interface
 
Route: /driver/navigate
The navigation page provides GPS-based guidance for the driver's active trip. It is only functional when the driver has an accepted, picked-up, or in-progress booking.
Interface Components:
•	Active trip status badge (Going to Pickup / Heading to Destination / In Progress)
•	Passenger name and contact information
•	Pickup address with GPS coordinates
•	Drop-off address with GPS coordinates
•	Interactive trip map component (TripMap) displaying pickup and drop-off pin markers
•	Trip fare and payment method summary
When No Active Trip:
•	A placeholder card is shown informing the driver to accept a booking first
Driver Earnings Interface
Figure 13. Driver Earnings Interface
 
Route: /driver/earnings
The earnings page provides a complete financial summary for the logged-in driver, showing income across different time periods and a detailed transaction history.
Summary Cards:
•	Total earnings (all time)
•	This week's earnings
•	This month's earnings
•	Total completed trips
Earnings History Table:
•	Date and time of each earning
•	Amount earned per trip (Philippine Peso)
•	Paginated list of the most recent 30 earning records
________________________________________



Driver Profile Interface
Figure 14. Driver Profile Interface
 Route: /driver/profile
The driver profile page displays the driver's account and vehicle information, verification status, ratings summary, and profile image.
Profile Information Displayed:
•	Profile image (with upload capability via Cloudinary)
•	Full name
•	Driver status badge (Verified / Pending / Suspended)
•	Email address
•	Phone number
•	Account registration date
•	Vehicle type, plate number, and model
•	Average passenger rating (star display)
•	Total number of bookings
________________________________________
Administrative Module
Admin Dashboard
Figure 15. Admin Dashboard Interface
 
Route: /admin
The administrator dashboard provides a comprehensive operational overview of the entire Pasakja system. It enables administrators to monitor transportation activity in real time and identify issues requiring attention.
Summary Cards:
•	Total bookings (all time)
•	Completed bookings
•	Pending bookings
•	Cancelled bookings
•	Active drivers (currently online and verified)
•	Total registered passengers
•	Total verified drivers
•	Drivers pending verification
•	Total platform revenue (sum of all earnings)
•	Unresolved SOS alerts count
Recent Bookings Table:
•	Booking status badge
•	Passenger name
•	Driver name (if assigned)
•	Pickup and drop-off addresses
•	Fare amount
•	Payment method
•	Date and time
Admin-Exclusive Capabilities:
•	Verify or suspend driver accounts
•	Monitor all SOS emergency alerts
•	Manage fare zones and rates
•	View platform-wide reports and analytics
•	Access system settings
________________________________________




Admin Booking Monitoring Interface
Figure 16. All Bookings Interface
 
Route: /admin/bookings
The bookings monitoring page displays every booking in the system across all statuses, allowing administrators to have a full view of all transportation transactions.
Booking List Columns:
•	Status badge (Pending / Accepted / Picked Up / In Progress / Completed / Cancelled)
•	Passenger name
•	Driver name (if assigned)
•	Pickup address
•	Drop-off address
•	Fare amount and quoted fare
•	Payment method (Cash / Online) and payment status (Unpaid / Paid)
•	Shared ride indicator
•	Date and time created
________________________________________
Admin Driver Management Interface
Figure 17. Driver Management Interface
 
Route: /admin/drivers
The driver management page allows administrators to review driver registrations, verify new drivers, and manage existing driver accounts.
Driver Status Summary Cards:
•	Count of Pending drivers
•	Count of Verified drivers
•	Count of Suspended drivers
Driver List Information:
•	Driver profile image and name initials
•	Email and phone number
•	Vehicle type, plate number, and model
•	License number
•	Verification status badge
•	Registration date
•	Total trip count and ratings count
•	Average rating score
Verification Actions:
•	Verify — Activates the driver account; driver can now toggle availability and accept bookings
•	Suspend — Deactivates a verified driver; driver cannot accept new bookings
•	Re-verify — Restores a suspended driver to active status
Ratings Panel:
•	Recent passenger ratings per driver are displayed with the rating score, comment, and reviewer name for accountability
________________________________________
Admin Passenger Management Interface
Figure 18. Passenger Management Interface
 
Route: /admin/passengers
The passenger management page displays all registered passengers and their account details, allowing administrators to monitor the passenger base.
Passenger List Columns:
•	Profile image and name initials
•	Full name
•	Email address
•	Phone number
•	Total number of bookings
•	Account registration date
________________________________________
Admin Fare and Zone Management Interface
Figure 19. Fare and Zone Management Interface
 
Route: /admin/fares
The fare and zone management page allows administrators to define service zones and configure the fare rates for each zone. This directly controls how fares are automatically calculated for passenger bookings.
Service Zone List:
•	Zone name
•	Zone description
•	Active / Inactive status badge
•	Base fare (Philippine Peso)
•	Per-kilometer rate (Philippine Peso per km)
Add New Zone Form:
•	Zone name (required)
•	Description (optional)
•	Base fare (required, numeric)
•	Per-kilometer rate (required, numeric)
•	Active status toggle
Fare Calculation Logic: Fare = Base Fare + (Distance in km × Per-km Rate)
The quoted fare is computed at booking time based on the active zone configuration.
________________________________________
Admin Reports and Analytics Interface
Figure 20. Reports and Analytics Interface
 
Route: /admin/reports
The reports page provides month-over-month analytics on booking volume, platform revenue, and driver performance, giving administrators the data needed to evaluate and improve transportation operations.
Summary Metrics:
•	This month's completed bookings vs. last month (with percentage change)
•	This month's revenue vs. last month (with percentage change)
•	Platform-wide average passenger rating
Top Drivers Table:
•	Driver name
•	Total completed trips
•	This month's earnings
•	Average rating
________________________________________
Admin SOS Alert Management Interface
Figure 21. SOS Alert Management Interface
 
Route: /admin/sos
The SOS alert management page displays all emergency alerts submitted by passengers. Unresolved alerts are highlighted with a red border and appear at the top of the list for immediate attention.
Alert Card Information:
•	Alert status (Active Emergency / Resolved) with color-coded badge
•	Passenger name, email, and phone number
•	GPS coordinates of the alert location
•	Optional message from the passenger
•	Timestamp of alert submission
Actions:
•	Mark as Resolved — Marks the alert as handled; card moves to the resolved section
•	Re-open — Re-opens a previously resolved alert if needed
________________________________________






Admin System Settings Interface
Figure 22. System Settings Interface
 
Route: /admin/settings
The system settings page provides a reference view of the platform configuration, including system identity, security implementation details, and operational parameters.
Settings Sections:
•	System Information: System name (Pasakja), version (v1.0.0), location (Socorro, Surigao del Norte), currency (Philippine Peso ₱)
•	Security: Authentication provider (NextAuth.js), session strategy (JWT), password hashing (bcryptjs, 12 rounds)
•	Database: ORM (Prisma), database provider (PostgreSQL/Supabase)
•	Notifications: Status of notification services (planned for future implementation)
________________________________________
Evaluation of the System
The system was evaluated using the ISO/IEC 9126 software quality model, measuring: functionality, efficiency, usability, reliability, maintainability, and portability. Evaluation was conducted using a 5-point Likert scale administered to selected evaluators including passengers, drivers, and community members.
A. Functionality
Criteria	Mean	Verbal Description
The system allows passengers to successfully register and book rides		
The system accurately computes fares based on zone and distance		
The system correctly manages driver availability and booking assignment		
Driver verification and admin management functions operate correctly		
The SOS emergency alert feature functions as intended		
Average Mean		
Justification: Role-based modules, GPS-based booking, automated fare computation, and admin oversight workflows ensure that the system performs all intended functions accurately and completely.
B. Efficiency
Criteria	Mean	Verbal Description
The system processes ride booking requests quickly		
Dashboard pages load without noticeable delay		
GPS tracking updates are reflected in a timely manner		
Trip history and reports generate within acceptable time		
Average Mean		
Justification: PostgreSQL with Prisma ORM, indexed database fields, and server-side pagination support responsive performance even during peak booking periods.
C. Usability
Criteria	Mean	Verbal Description
The system is easy to learn and use for first-time passengers		
Navigation between pages is clear and intuitive for all user roles		
Forms and error messages are easy to understand		
The interface works well on both mobile and desktop browsers		
Role-specific menus reduce confusion between user types		
Average Mean		
Justification: shadcn/ui components, Tailwind CSS responsive layout, and role-filtered navigation simplify the experience for passengers, drivers, and administrators alike.
D. Reliability
Criteria	Mean	Verbal Description
The system behaves consistently during repeated booking operations		
Trip status updates are accurately reflected across all user roles		
Error messages clearly explain what went wrong		
Data remains accurate after multiple booking and trip operations		
Average Mean		
Justification: TypeScript type safety, Zod runtime validation, Prisma foreign key constraints, and role-aware access control collectively improve system reliability and data consistency.
E. Maintainability
Criteria	Mean	Verbal Description
The codebase is organized and understandable		
Database schema changes can be applied via migrations		
New features can be added without requiring major rework		
Average Mean		
Justification: Modular Next.js App Router structure, Prisma schema migrations, and shared Zod validation schemas support ongoing maintenance and future feature additions.
F. Portability
Criteria	Mean	Verbal Description
The system runs correctly in standard web browsers		
The system can be deployed on different hosting environments		
The system is accessible on various screen sizes and devices		
Average Mean		
Justification: Web-based deployment using Node.js and PostgreSQL, environment variable configuration, and responsive CSS design support deployment across local servers, cloud platforms, and diverse client devices.
System Evaluation Summary
Evaluation Criteria	Mean	Verbal Description
Functionality		
Efficiency		
Usability		
Reliability		
Maintainability		
Portability		
Grand Mean		

________________________________________
Key Achievements
Pasakja addresses the limitations of manual, informal community transportation practices:
1. Accessibility and Convenience
•	Passengers can book rides from any browser-enabled device without going to a physical terminal
•	GPS-based location capture eliminates the need to manually type addresses
•	Multiple payment options (cash and GCash) accommodate different passenger preferences
2. Accountability and Transparency
•	Mutual rating system promotes consistent service quality from drivers
•	Full trip history is accessible to passengers, drivers, and administrators
•	Driver verification process ensures only registered, approved drivers operate on the platform
3. Operational Efficiency
•	Automated fare computation eliminates fare disputes and manual calculations
•	Drivers see all available bookings in one place and can accept with a single action
•	Trip progression workflow (Accept → Pickup → In Progress → Complete) ensures every step is recorded
4. Safety and Emergency Response
•	SOS emergency button with GPS coordinates is accessible to passengers at all times
•	Admin SOS dashboard enables immediate administrator response to active alerts
•	Driver verification with background information reduces passenger safety risks
5. Administrative Control
•	Zone and fare management allows administrators to update pricing without code changes
•	Month-over-month reports provide visibility into platform growth and revenue
•	Driver management tools (verify, suspend, re-verify) give administrators complete control over who operates on the platform
________________________________________
System Advantages
Modern Technology Stack
•	Next.js App Router — server components, API routes, and middleware in a single framework
•	TypeScript — type-safe application code reducing runtime errors
•	PostgreSQL + Prisma — reliable relational data model with schema migrations
•	NextAuth.js — industry-standard JWT authentication with role-aware session handling
•	Cloudinary — scalable cloud-based profile image storage and delivery
•	PayMongo — Philippine-native payment gateway with GCash integration
Scalability
•	Component-based React architecture with shadcn/ui for consistent, reusable UI
•	Normalized relational schema: User, Passenger, Driver, Admin, Booking, Trip, Rating, Earning, Zone, Fare, Notification, SosAlert
•	Role-group-based routing structure easily supports adding new roles or modules
•	Database indexing on high-query fields (email, driver status, booking status, passenger ID)
Developer Experience
•	Single Next.js repository with clear separation: app/ for routing, components/ for UI, lib/ for utilities, prisma/ for schema and migrations
•	Environment variable configuration for easy deployment to different environments
•	Prisma Studio available for direct database inspection during development and testing
________________________________________
Comparison with Traditional Methods
The Pasakja web-based system offers significant improvements over traditional manual community transportation practices:
Traditional Method	Pasakja System	Improvement
Flagging down tricycles/motorcycles manually	GPS-based ride booking from any device	Convenient, instant booking from any location
Uncertain waiting time with no information	Real-time booking status and driver updates	Full transparency and reduced passenger anxiety
Verbal fare negotiation with driver	Automated fare computation by zone and distance	Clear, standardized, dispute-free pricing
Cash-only transactions	Cash and GCash online payments via PayMongo	Flexible payment options for all passengers
No driver accountability record	Mutual rating system and full trip history	Measurable, public service quality records
Manual dispatching by transport operators	Automatic driver-passenger matching by availability	Faster and more organized dispatch
No emergency protocol for passengers	SOS emergency alert with GPS coordinates	Immediate admin response to passenger emergencies
Paper trip records and logbooks	Digital trip history with all statuses persisted	Searchable, permanent, and tamper-evident records
No income tracking for drivers	Earnings dashboard with weekly/monthly summaries	Drivers can monitor and plan their income
________________________________________
Limitations and Future Enhancements
While the system successfully meets its capstone objectives, the following enhancements are identified for future development:
1.	Live Map Rendering — Integrate a live map SDK (Leaflet.js or Google Maps API) to visually display driver and passenger locations on a real-time map within the booking and navigation interfaces
2.	Production Payment Gateway — Connect to a verified PayMongo merchant account to process live GCash and card transactions beyond the current test-account implementation
3.	Push and SMS Notifications — Add push notifications and SMS alerts to notify passengers and drivers of booking status changes without requiring them to keep the page open
4.	Mobile Application — Develop a Progressive Web App (PWA) or dedicated Android/iOS application using the existing system as the API backend
5.	Advanced Analytics — Add trend charts, demand forecasting, and driver performance analytics to the admin reports module
6.	Route Optimization — Integrate a routing API to provide turn-by-turn navigation inside the driver navigation interface
7.	Shared Ride Matching — Fully implement the shared ride feature to automatically match compatible passenger bookings traveling similar routes
8.	Periodic Security Audits — Implement scheduled security reviews and penetration testing to ensure the system remains secure as user volume grows
________________________________________
Conclusion
The evaluation and implementation demonstrate that Pasakja: A Web-based Community Transportation Booking & Dispatching System meets the transportation management needs of Socorro, Surigao del Norte. The system successfully digitizes the entire transportation booking lifecycle — from passenger registration and ride booking, to driver dispatching and trip completion, to administrative oversight and emergency response. GPS-based booking, automated fare computation, cashless payment integration, and role-based access control collectively transform an informal, manual system into an organized, accountable, and technology-driven community transportation platform.
Overall Assessment:
•	Verbal Description: Strongly Agree
•	System Status: Functional and deployment-ready for community pilot use
•	System Version: v1.0.0
Key strengths include GPS-assisted booking, automated fare computation by zone, PayMongo GCash integration, driver verification workflows, SOS emergency alert management, mutual rating systems, and a comprehensive administrative dashboard with real-time reporting.
The project demonstrates successful application of modern web development practices — Next.js, TypeScript, Prisma ORM, NextAuth, Cloudinary, and user-centered responsive design — to solve a real community transportation problem within the capstone scope.
________________________________________




Chapter 6
SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS
6.1 Summary
Pasakja was designed and implemented as a web-based community transportation booking and dispatching platform for Socorro, Surigao del Norte. The developed system operationalizes core transportation management functions for three distinct user roles — passengers, drivers, and administrators — using a centralized, role-based web architecture. The system addresses common community transportation problems including inefficient manual booking, unclear fare structures, unorganized dispatching, and lack of real-time transparency.
The system was developed using a modern full-stack technology stack comprising Next.js App Router, TypeScript, PostgreSQL, Prisma ORM, NextAuth, Tailwind CSS, and shadcn/ui. Additional integrations include Cloudinary for profile image management, PayMongo for online payment processing, and the Browser Geolocation API for GPS-based location services.
6.2 Conclusions
Based on the implemented modules and evaluated workflows, the study concludes that:
1.	A web-based platform can effectively digitize local ride booking and dispatching processes, eliminating the need for manual, in-person coordination between passengers and drivers.
2.	Role-specific modules for passengers, drivers, and administrators improve coordination, reduce confusion, and ensure that each user type has access to the tools and information most relevant to their needs.
3.	Centralized booking records, trip status tracking, and administrative reports improve operational transparency and support data-driven decision-making.
4.	Safety and accountability are strengthened through driver verification workflows, trip history records, mutual rating systems, and SOS emergency alert functionality.
5.	GPS-based location services, automated fare computation, and cashless payment integration improve the overall ride experience and bring community transportation in line with the standards set by nationally recognized platforms such as Grab, Joyride, and Angkas.
6.	The solution is suitable as a practical capstone output and a deployable foundation for community transportation modernization in Socorro, Surigao del Norte.


6.3 Recommendations
For further development and institutional deployment, the following enhancements are recommended:
•	Real-Time Map Integration: Integrate a live map SDK (such as Leaflet.js or Google Maps API) to display real-time driver and passenger locations on a visual map within the booking interface.
•	Production Payment Gateway: Connect to a verified PayMongo merchant account to enable live GCash and online payment transactions.
•	Push and SMS Notifications: Implement push notifications and SMS alerts to keep passengers and drivers informed of booking status changes in real time.
•	Pilot Deployment: Conduct a pilot deployment in the Socorro community with a measured usability and satisfaction evaluation using ISO 9126 criteria.
•	Mobile Application: Develop a Progressive Web App (PWA) or native mobile application to extend accessibility and improve the mobile user experience.
•	Periodic Security Audits: Implement scheduled security and performance reviews to ensure the system remains secure and reliable as user volume grows.
•	Expanded Transport Options: Extend the system to support additional vehicle types and transport operators within the broader Surigao del Norte region.






















REFERENCES

AbdelAziz, A., Alarabi, L., Basalamah, S., & Hendawi, A. (2019). Trans-Sense: Real time transportation schedule estimation using smart phones. arXiv.
Source: https://arxiv.org/abs/1906.07575
Adekola, O. D., Adekunle, Y. A., & Bello, O. (2021). An online road transport booking system. African Journal of Computing & ICT.
Source: https://ajcst.co/index.php/ajcst/article/view/2913
Angkas, Inc. (2023). Angkas: The first LTFRB-regulated motorcycle taxi ride-hailing platform in the Philippines.
Source: https://angkas.com
Barrera Hernandez, J. E., Moctezuma Olvera, M. A., García Macías, J. A., & Ramírez Sámano, M. A. (2025). Optimization of bus dispatching in public transportation through a heuristic approach based on passenger demand forecasting. Smart Cities, 8(3), 87.
Source: https://www.mdpi.com/2624-6511/8/3/87
Cramer, J., & Krueger, A. B. (2016). Disruptive change in the taxi business: The case of Uber. American Economic Review, 106(5), 177–182.
Source: https://doi.org/10.1257/aer.p20161002
Dexter. (2025). STCS capstone projects. NavRide: Web-based vehicle booking system.
Source: https://fliphtml5.com/zooax/myaf/STCS_CAPSTONE_PROJECTS/
Estrada-Esquivel, H., Pozos-Parra, M. P., Linares-Flores, A., Cuevas-Tello, J. C., & Molina-Macías, A. (2022). A smart information system for passengers of urban transport based on IoT. Electronics, 11(5), 834.
Source: https://www.mdpi.com/2079-9292/11/5/834
Grab Holdings Inc. (2023). Grab: Southeast Asia's leading superapp — transportation, delivery, and financial services across eight countries.
Source: https://grab.com
Iliopoulou, C., & Kepaptsoglou, K. (2019). Combining ITS and optimization in public transportation planning: State of the art and future research paths. European Transport Research Review, 11, 27.
Source: https://link.springer.com/article/10.1186/s12544-019-0365-5
Joyride Group, Inc. (2022). Joyride: Revolutionizing last-mile transportation in the Philippines through motorcycle taxi and tricycle ride-hailing services.
Source: https://joyridegroup.com
Pizarro, J. B., Gumabay, M. V. N., & Gumarang, S. G. (2025). TC-TRISSEA (Tuguegarao City Tricycle Riders Information, Security and Satisfaction Enhancement App) — A proposed mobile app for tricycle commuters of Tuguegarao City. International Journal of Innovative Technology and Exploring Engineering.
Source: https://www.researchgate.net/publication/392235358
Ulay, D. A. L. L., Domingo, A. D. D., Beran, C. J. A., Lazarte, A. L. S., et al. (2025). GTRIKE: Internet-based mobile application for tricycle reservation in San Jose, Occidental Mindoro. International Journal of Research Studies in Educational Technology.
Source: https://consortiacademia.org/wp-content/uploads/2024/e9i01/E25012_final.pdf


















Curriculum Vitae
Personal Information
 Name : Researcher 1 
Nickname : 
Age : 
Date of Birth : 
 Civil Status : 
 Religion : 
 Place of Birth : 
Home address : 
 Email address : 
Contact Number: 
Educational Background 
Elementary : 
 High School : 
Senior High School : 
Tertiary : 










