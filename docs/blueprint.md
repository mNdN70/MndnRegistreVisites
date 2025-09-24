# **App Name**: VisitWise

## Core Features:

- General Entry Logging: Capture visitor details including ID, name, company, visit purpose, person to visit, and department. Implemented using form fields. Persisted via local storage (MVP)
- Transporter Entry Logging: Capture details specific to transporters, including haulier company and vehicle registration information, and persist them via local storage (MVP)
- Exit Logging: Record exit times based on visitor ID lookup of active entries. The lookup is constrained to entries logged on the current date which do not have an exit time already saved, in local storage.
- Data Persistence: Stores entries in the browser's local storage, avoiding a full database (MVP)
- Active Visit Validation: Check and prevent duplicate active entries by ID.  Displays a message if an active visit exists: 'Ya existe una visita activa para este DNI/NIE. Debe registrar la salida antes de una nueva entrada.'
- Entry Button: A tool will enable the entry button to toggle. A LLM decides when the user has checked the treatment of data, and uses a tool to enable or disable the entry button.

## Style Guidelines:

- Primary color: Dark moss green (#4A734D) to convey trustworthiness and stability.
- Background color: Light beige (#F2F0EC) to create a clean and neutral backdrop.
- Accent color: Terracotta (#B35A47) to draw attention to important elements like CTAs.
- Headline font: 'Belleza', a sans-serif with a touch of personality, well-suited for headlines. Body text: 'Alegreya', a serif to give the page an elegant intellectual feel.
- Simple, professional icons to represent different entry types and actions (e.g., a person icon for general entry, a truck icon for transporter entry, an exit sign icon for logging exits).
- A clean, intuitive layout with clear sections for each main function: General Entry, Transporter Entry, Exit. Prioritize ease of use for quick data input and retrieval.
- Subtle transitions and feedback animations to enhance user experience (e.g., a fade-in effect when displaying confirmation messages).