// Advocacy content for vincentkafula's website.
// Source of truth: "Build One Zambia — Official Website Content" (BuildOneZambia_Website_Content.docx).
// Wording is adapted for the web but the substance of each proposal is kept as written in the
// source document. Figures quoted here are as stated in that document and should be checked
// against primary sources before being cited elsewhere.

export const sourceDocument = {
    title: 'Build One Zambia — Official Website Content',
    subtitle: 'Campaign platform and policy proposals',
    docx: '/documents/BuildOneZambia_Website_Content.docx',
    pdf: '/documents/BuildOneZambia_Website_Content.pdf',
};

export const movement = {
    tagline: 'Zambia is waiting. The time to act is now.',
    strapline: 'Let us build the Zambia we all deserve — together.',
    intro: 'Build One Zambia is more than a political campaign. It is a national movement rooted in the belief that Zambians — our farmers, builders, teachers, entrepreneurs and young people — have everything it takes to transform this country.',
    rejects: [
        'No more opaque tender systems.',
        'No more foreign contractors walking away with our wealth.',
        'No more empty promises.',
    ],
    vision: 'From the busy streets of Lusaka to the fertile fields of Eastern Province, from the mines of the Copperbelt to the villages of Western Province, Build One Zambia aims to build one Zambia: a nation where every family has a roof over its head, every farmer has the means to succeed, and every province thrives with energy and opportunity.',
    closing: 'One Zambia. One future. Built by us.',
};

// The four headline promises from the home page of the source document.
export const promises = [
    {
        icon: 'fa-solid fa-house-chimney',
        title: 'Homes for every family',
        text: 'Government-owned construction machinery in every municipality, so that communities can build their own homes.',
        link: '/advocacy/housing-revolution',
    },
    {
        icon: 'fa-solid fa-bolt',
        title: 'Power in all provinces',
        text: 'Ten new power plants — one in each province — to deliver reliable electricity from dawn to dusk.',
        link: '/advocacy/provincial-industry',
    },
    {
        icon: 'fa-solid fa-seedling',
        title: 'Fertiliser for our fields',
        text: 'A fertiliser production plant in every province to boost harvests and end food insecurity.',
        link: '/advocacy/provincial-industry',
    },
    {
        icon: 'fa-solid fa-cubes-stacked',
        title: 'Cement and stone for growth',
        text: 'Local production facilities across the country to supply construction and create thousands of lasting jobs.',
        link: '/advocacy/provincial-industry',
    },
];

// Principles that run through every proposal in the document.
export const principles = [
    {
        title: 'Zambian hands do the work',
        text: 'All manual and skilled labour is performed by Zambian workers, and Zambians operate the machinery.',
    },
    {
        title: 'The state buys the machines, not the contracts',
        text: 'Government procures equipment and materials directly, replacing the tender system that has enabled corruption.',
    },
    {
        title: 'Skills stay in Zambia',
        text: 'Foreign specialists are engaged only as individuals, never through companies, to train Zambian professionals.',
    },
    {
        title: 'Materials made at home',
        text: 'Cement, aggregates, steel and asphalt are sourced and produced locally to keep money circulating in the economy.',
    },
];

// Key figures as stated in the source document.
export const keyFacts = [
    { value: 'USD 28.9 bn', label: 'Approximate public debt the debt strategy is designed to address' },
    { value: '10', label: 'Provinces, each to receive a power plant, fertiliser plant and a UNZA campus' },
    { value: '70%+', label: 'Share of Zambia’s export earnings that comes from copper' },
    { value: '73', label: 'Tribes in one nation, each to be honoured by a cultural museum' },
];

export const people = [
    'Farmers', 'Builders', 'Teachers', 'Entrepreneurs', 'Young people',
];

// ---------------------------------------------------------------------------
// Advocacy priorities. Each has a summary (what / why / approach / outcome)
// used on the overview pages, and detailed sections used on its own page.
// ---------------------------------------------------------------------------

const Advocacy = [
    {
        slug: 'transport-infrastructure',
        title: 'Transport Infrastructure',
        icon: 'fa-solid fa-road',
        short: 'Roads, railways and airports built by Zambian workers with government-owned machinery, instead of through foreign contractors.',
        metaDescription: 'Build One Zambia’s people-powered plan for roads, rail, cargo and passenger airports — built by Zambians with government-procured machinery.',
        summary: {
            issue: 'Key infrastructure projects have been dominated by foreign companies.',
            why: 'These firms often performed minimal work while sharing returns with corrupt officials, leaving Zambian workers with low wages or none at all and communities with no lasting skills.',
            approach: 'Government buys the machinery and materials directly, Zambians do all the work, and foreign engineers are engaged only as individuals to transfer skills.',
            outcome: 'Transparent spending, thousands of jobs, permanent national capacity and faster, more sustainable results.',
        },
        intro: [
            'Build One Zambia is committed to a “Zambia First” development philosophy — one that is practical, people-centred and firmly opposed to the old system of endless contracts, foreign firms extracting profits while citizens receive little, and corruption that drains national resources.',
            'Previous governments allowed foreign companies to dominate key infrastructure projects. These firms often performed minimal work while sharing returns with corrupt officials, leaving Zambian workers with low wages or none at all — and leaving communities with no lasting skills or benefits.',
        ],
        sections: [
            {
                heading: 'A people-powered infrastructure strategy',
                text: ['The proposal places Zambians at the forefront of building their own country:'],
                bullets: [
                    'The government will directly procure modern machinery, equipment and materials, bypassing tenders to middlemen or foreign firms entirely.',
                    'Local Zambians will operate the machinery, drive the bulldozers, lay the tracks and build the runways in every province and district.',
                    'All manual and skilled labour will be performed by Zambian workers, creating thousands of well-paid, dignified jobs across the nation.',
                    'Only specialised foreign engineers will be engaged — as individuals, never through companies — to work alongside qualified Zambian engineers, with a clear mandate to transfer skills and build permanent national capacity.',
                    'Most construction materials — cement, aggregates, steel and asphalt blends — will be sourced and produced locally, stimulating Zambian industry, creating supply-chain jobs and keeping money circulating in the economy.',
                ],
            },
            {
                heading: 'Why this approach',
                text: ['According to the document, this strategy promotes transparency, combats corruption, maximises job creation, fosters national pride and ownership, and delivers faster, more sustainable outcomes. Its aim is to build Zambia with Zambian hands, Zambian minds and Zambian resources.'],
            },
            {
                heading: 'The pledge',
                text: ['Build One Zambia promises Zambian-led development rather than contracts or foreign handouts: machinery in Zambian hands, wages in Zambian pockets, skills embedded in Zambia permanently, and corruption eradicated at every level. Every province and district is to benefit, because the work is done by Zambians, for Zambians.'],
            },
        ],
        children: ['roads', 'rail', 'cargo-airports', 'passenger-airports'],
        quote: 'Choose progress. Choose ownership. Choose Zambia First. Together, we will build the Zambia we deserve.',
    },
    {
        slug: 'agricultural-mechanisation',
        title: 'Agricultural Mechanisation',
        icon: 'fa-solid fa-tractor',
        short: 'Tractors, harrows, disc implements, planters and irrigation for 20-member farmer cooperatives, financed transparently with no middlemen.',
        metaDescription: 'Build One Zambia’s plan to equip 20-member farmer cooperatives with tractors, harrows, disc implements, precision planters and irrigation equipment.',
        summary: {
            issue: 'Most farmers still rely on slow, manual land preparation and on the rains.',
            why: 'Zambia’s fertile soil is one of its greatest assets, yet subsistence farming limits income and food security.',
            approach: 'Equip 20-member farmer cooperatives with modern machinery through transparent, accountable financing, with partnerships for sourcing, maintenance and export.',
            outcome: 'Larger harvests, year-round production, surplus for sale and cooperatives that own their own assets.',
        },
        intro: [
            'Zambia’s fertile soil is one of the nation’s greatest assets. Build One Zambia is committed to placing the tools of modern agriculture directly into the hands of Zambian farmers, through transparent, accountable, cooperative-based models that eliminate middlemen and corruption.',
            'Under the proposal, farmers form cooperatives of 20 members. Equipment is sourced from reputable manufacturers in China and the United States, with no middlemen. Cooperatives would partner with U.S. Chambers of Commerce, including AmCham Zambia, for expert sourcing, maintenance support and export pathways to American markets.',
        ],
        sections: [
            {
                heading: 'Tractors — power and prosperity for Zambian farmers',
                text: ['Turning weeks of arduous land preparation into days of efficient, productive work.'],
                outcomeLabel: 'What this means for farmers',
                bullets: [
                    'Cultivate larger areas more quickly to make the most of each rainy season and diversify crops.',
                    'Reduce the burden of manual labour, freeing youth and women to focus on value addition and family welfare.',
                    'Boost yields — turning subsistence farming into surplus production for real income and food security.',
                    'Build economic independence: each cooperative owns its assets and grows its own profits.',
                ],
            },
            {
                heading: 'Harrows — the foundation your crops deserve',
                text: ['Healthy soil is the foundation of every successful harvest. Harrows would be delivered to cooperatives with transparent financing and allocation, and guidance on sourcing and export opportunities.'],
                bullets: [
                    'Create fine, uniform seedbeds that maximise germination and plant health.',
                    'Work fertilisers and crop residues into the soil effectively.',
                    'Control weeds early to save time and reduce manual labour.',
                    'Invest in long-term soil health for sustained productivity and household income.',
                ],
            },
            {
                heading: 'Disc implements — cutting through barriers to bigger yields',
                text: ['Zambia’s diverse soils demand tools that do not compromise. Cooperatives would be equipped with robust disc ploughs and disc harrows, procured transparently.'],
                bullets: [
                    'Work heavy clay, weedy or compacted soils with less effort.',
                    'Promote conservation tillage for healthier, erosion-resistant farmland.',
                    'Prepare fields faster to reduce delays and post-harvest risks.',
                    'Turn challenging conditions into higher productivity and profits.',
                ],
            },
            {
                heading: 'Precision planters — planting smarter, harvesting more',
                text: ['No more uneven rows or wasted seed. Partnerships would provide calibration training, market access and export pathways for surplus production.'],
                bullets: [
                    'Achieve exact seed spacing and depth for optimal growth and easier crop management.',
                    'Significantly reduce seed waste while improving germination rates.',
                    'Plant quickly to align with the seasonal rains.',
                    'Diversify into cash crops for greater, more reliable household income.',
                ],
            },
            {
                heading: 'Irrigation equipment — farming every season',
                text: [
                    'Rainfall cannot be controlled, but with the right infrastructure a farmer’s success can be. Build One Zambia would provide subsidised irrigation equipment — pumps, drip systems and sprinklers — to cooperatives, with transparent delivery and technical support.',
                    'Solar-powered, low-maintenance irrigation would be prioritised in drought-prone areas, and Build One Zambia would advocate for international development institutions to fund equipment directly rather than issuing cash loans.',
                ],
                bullets: [
                    'Unlock dry-season cropping for two or three harvests a year.',
                    'Grow high-value vegetables, fruits and speciality crops profitably.',
                    'Reduce climate risk and secure family nutrition year-round.',
                    'Achieve genuine economic independence through reliable, year-round production.',
                ],
            },
        ],
        quote: 'Water is life. With Build One Zambia, prosperity is within reach for every Zambian farmer.',
    },
    {
        slug: 'housing-revolution',
        title: 'Housing Revolution',
        icon: 'fa-solid fa-house-chimney',
        short: 'Government-owned construction machinery in every municipality, and the redevelopment of unplanned settlements without displacing residents.',
        metaDescription: 'Build One Zambia’s housing plan: municipal construction machinery, redevelopment of unplanned settlements with priority for current residents, and home ownership for Zambians.',
        summary: {
            issue: 'Many families live in unsafe, unplanned settlements, pay unaffordable rents or have no secure home.',
            why: 'Poor housing brings preventable disease, while corrupt contracts have enriched a privileged few.',
            approach: 'The state owns and deploys construction machinery in every municipality; Zambian workers and communities build multi-storey homes, with current residents given first choice.',
            outcome: 'Safe, modern, owned homes with clean water, sanitation and power — and an end to perpetual renting.',
        },
        intro: [
            'For too long, Zambian families have faced preventable disease, lived in unsafe and unplanned settlements, paid unaffordable rents, and watched a privileged few grow wealthy from corrupt contracts while many remain homeless or without security.',
            'Under a Build One Zambia government, the state would take direct responsibility for rebuilding the country. Instead of costly, corrupt contracting systems, government would own and deploy modern construction machinery in every municipality, and Zambian workers, youth and communities would operate it to build safe, modern homes for themselves and their neighbours.',
        ],
        sections: [
            {
                heading: 'Redeveloping unplanned settlements with dignity',
                text: ['Unplanned settlements and informal compounds would be redeveloped — not by displacing residents, but by replacing small, unsafe structures with tall, modern buildings that offer proper sanitation, clean water, reliable electricity and dignity for every family.'],
                bullets: [
                    'Current title holders in affected areas receive first priority and choose their preferred floor in the new buildings, beginning with the ground floor if they wish.',
                    'Remaining units are allocated to fellow Zambians who cannot currently afford secure housing.',
                    'Government provides free labour support so that no family is left behind.',
                    'Only Zambians may own homes. Foreign nationals may rent units, but ownership belongs to Zambians.',
                ],
                callout: 'No Zambian should live in rented accommodation indefinitely. Home ownership is a right, not a privilege.',
            },
            {
                heading: 'Infrastructure for dignity',
                bullets: [
                    'Tourism hotels owned and operated by Zambian entrepreneurs, to create jobs and strengthen the economy.',
                    'New dams and upgraded water systems so every home has clean, running water around the clock.',
                    'Modern sewage infrastructure across cities and towns to end cholera outbreaks for good.',
                    'Electricity generation capacity in each district, for reliable and affordable power.',
                ],
                after: ['Zambians would lead every phase of construction. Foreign engineers and architects would be engaged only to support and train Zambian teams — never to replace them.'],
            },
            {
                heading: 'The machinery that will build the new Zambia',
                items: [
                    { title: 'Tower cranes', text: 'Deployed in every major municipality to replace low, unsafe structures with strong, multi-storey buildings. Building upward rather than outward creates more homes on the same land and halts the spread of informal settlements.' },
                    { title: 'Concrete pumps', text: 'Boom, line and trailer pumps deliver concrete continuously to upper floors, walls and slabs, so that buildings are durable, safe and finished on schedule.' },
                    { title: 'Passenger hoists', text: 'Enclosed construction lifts move workers, tools and materials to upper levels in minutes instead of by hazardous climbs, protecting the workforce and speeding up progress.' },
                    { title: 'Concrete batching plants', text: 'Positioned across the country to produce consistent, high-strength concrete close to each site, reducing dependence on distant suppliers and lowering transport costs.' },
                    { title: 'Stone crushers', text: 'Turn raw rock and recycled material into the sand, gravel and crushed stone needed for concrete, foundations and roads — cutting import costs and creating local jobs.' },
                ],
            },
        ],
        quote: 'A Zambia where every family owns a safe, modern home. A Zambia free from cholera, unreliable water and perpetual rent. A Zambia built by Zambians, for Zambians.',
    },
    {
        slug: 'community-infrastructure',
        title: 'Schools, Hospitals and Community Infrastructure',
        icon: 'fa-solid fa-school',
        short: 'Schools in every ward, a UNZA campus in every province, colleges in every district, hospitals, stadiums, libraries, parks and cultural museums.',
        metaDescription: 'Build One Zambia’s commitments on schools, University of Zambia campuses in all ten provinces, district colleges, hospitals, stadiums, libraries, parks and cultural museums.',
        summary: {
            issue: 'Quality public facilities — especially higher education and hospitals — are concentrated in a few places, and many projects have been abandoned to corruption.',
            why: 'Children, students and patients should not have to travel far from home for education or care.',
            approach: 'The state supplies heavy machinery to municipalities, Zambian citizens build every structure, and materials come from Zambian quarries, factories and workshops.',
            outcome: 'World-class public infrastructure in every province, district and community, with hundreds of direct jobs at each site.',
        },
        intro: [
            'The vision is world-class public infrastructure in every province, district and community — built by Zambians, for Zambians, using Zambian hands and Zambian resources. No more foreign contractors leaving with billions while Zambians receive little in return, and no more unfinished projects abandoned to corruption.',
            'Under the proposal, the state would supply heavy machinery directly to municipalities, Zambian citizens would operate the equipment and complete every structure, and virtually all materials would come from Zambian quarries, factories and workshops. Foreign involvement would be limited to individual engineers and architects, engaged personally to train Zambian professionals until all skills are transferred.',
        ],
        sections: [
            {
                heading: 'Projects Build One Zambia commits to delivering',
                items: [
                    { title: 'Modern schools in every ward', text: 'Fully equipped primary and secondary schools in every ward, with laboratories, libraries, ICT labs, clean water, sanitation and solar power where required — built by local teams using government machinery.' },
                    { title: 'University of Zambia campuses in all ten provinces', text: 'A full UNZA satellite campus in each province, with faculties suited to regional strengths: agriculture and mining in the Copperbelt and North-Western Provinces, medicine and health sciences in high-population provinces, and education and business nationwide. No student should have to move far from home or drop out because of financial pressure.' },
                    { title: 'Technical and vocational colleges in every district', text: 'Training in engineering, mechanics, construction, ICT, agriculture, hospitality, renewable energy and more, feeding graduates directly into the public works programme.' },
                    { title: 'District and provincial hospitals', text: 'New district hospitals in underserved areas and upgraded provincial referral hospitals with operating theatres, diagnostic laboratories, maternity and paediatric units, emergency departments and specialist clinics — staffed by Zambian health workers trained at home.' },
                    { title: 'Stadiums and multi-purpose sports complexes', text: 'Modern venues in every province able to host league matches, international tournaments, concerts and community events, with pitches, tracks, courts, pools and gyms — nurturing the next generation of Chipolopolo champions.' },
                    { title: 'Palaces for traditional leaders', text: 'Modern, secure palaces built or rehabilitated in chiefdoms across the country, with offices, meeting halls, guest quarters and community spaces, built with local labour and materials.' },
                    { title: 'Recreation parks in every town', text: 'Public parks in every urban and peri-urban centre with walking paths, playgrounds, sports fields, picnic areas and shaded seating.' },
                    { title: 'Public libraries in every constituency', text: 'Well-stocked libraries offering books, digital resources, internet access, reading rooms and programmes for children, students and adults.' },
                    { title: 'Cultural museums for every tribe', text: 'Museums honouring the history, traditions, art, music, clothing, tools and stories of Zambia’s 73 tribes, built and curated with the communities they celebrate.' },
                ],
            },
            {
                heading: 'A national mission',
                text: ['The document describes each of these projects as a firm commitment rather than a wish list. Each site would create hundreds of direct jobs — operators, masons, electricians, drivers and supervisors — and thousands more across supply chains in cement factories, steel mills, timber yards and transport.'],
            },
        ],
        quote: 'The old system enriched foreigners and a handful of corrupt officials. Our system enriches Zambian families, Zambian communities and Zambia’s future.',
    },
    {
        slug: 'mining-strategy',
        title: 'Mining Strategy',
        icon: 'fa-solid fa-gem',
        short: 'New mines 100% Zambian-owned, and all ore processed in Zambia by Zambian-owned companies before export.',
        metaDescription: 'Build One Zambia’s mining strategy: 100% Zambian ownership of new mines and local processing of copper, battery minerals, gold, manganese and gemstones.',
        summary: {
            issue: 'Zambia’s mineral wealth has largely left the country as raw ore and concentrate.',
            why: 'Profits have been captured by foreign companies and a handful of corrupt officials instead of ordinary families.',
            approach: 'All new mines are 100% Zambian-owned; existing foreign-owned mines keep their ownership but must sell their entire output to Zambian processing companies.',
            outcome: 'Higher government revenue, factories in every province and well-paid jobs for Zambians.',
        },
        intro: [
            'Zambia holds some of the richest mineral deposits on earth. For too long, however, that wealth has left the country as foreign companies and a handful of corrupt officials captured the profits. The vision of Build One Zambia is that Zambians will develop Zambia’s minerals for Zambians.',
        ],
        sections: [
            {
                heading: 'The plan',
                bullets: [
                    'All new mines will be 100% Zambian-owned.',
                    'Existing foreign-owned mines keep their current ownership but may no longer export raw minerals. They must sell their entire ore output to Zambian-owned processing companies that turn it into finished products for the global market.',
                    'These processing companies will partner with reputable investors from China and the United States to secure capital and technology without giving up ownership of the resources.',
                    'Government will supply heavy machinery and build modern infrastructure in every mineral-rich municipality so that local entrepreneurs can establish factories.',
                    'All manual labour and machine operation will be done by Zambian men and women. Only individual foreign engineers and architects, on personal contracts, will be permitted on site to train Zambian engineers.',
                    'Virtually all materials for factories and infrastructure will be sourced and manufactured locally.',
                ],
                after: ['The document presents this as a comprehensive overhaul intended to multiply government revenue, create hundreds of thousands of well-paid jobs, establish factories in every province and ensure that ordinary families share in the country’s prosperity.'],
            },
            {
                heading: 'Copper — Zambia’s economic backbone',
                text: [
                    'According to the source document, copper accounts for more than 70% of Zambia’s export earnings, and Zambia is Africa’s second-largest producer. In 2025 the country produced a record 890,346 metric tonnes — an 8% increase — with Konkola Copper Mines alone quadrupling output to more than 80,000 tonnes. Most of that wealth has left as raw cathodes and concentrates.',
                    'Under the strategy, new copper projects would be Zambian-owned from the start. Existing major operations — Lumwana, Konkola, Mopani and Kansanshi — would continue under their current owners but sell their entire output to Zambian processors. Those firms, partnering with Chinese and American technology investors, would manufacture wires, cables, busbars and components for electric vehicles, renewable energy and artificial intelligence industries.',
                    'Every Copperbelt and North-Western municipality would be equipped with roads, power and heavy machinery so Zambian entrepreneurs can build these factories, with every job — from truck drivers to furnace operators — going to Zambians.',
                ],
            },
            {
                heading: 'Battery and critical minerals',
                text: [
                    'Cobalt, nickel, lithium, graphite and rare earth elements are the raw materials of electric vehicles and renewable energy, and the document sets out Zambia’s position to supply them: six active cobalt operations and Africa’s first major cobalt sulphate refinery coming online; rising nickel output from projects such as Enterprise and Munali; high-grade lithium in the Choma Belt; flake graphite in Eastern Province; and rare earth elements at Kesya and Nkombwa Hill.',
                    'All new projects in these minerals would be 100% Zambian-owned, and existing operations would sell their output to local processors producing battery chemicals, anodes, cathodes and refined rare earths in Zambia.',
                ],
            },
            {
                heading: 'Gold, manganese and gemstones',
                text: [
                    'The document describes Zambia as the world’s largest emerald producer, led by the Kagem mine, notes that manganese output in Luapula Province has more than doubled over the past decade, and that gold production is growing quickly with a large contribution from artisanal and small-scale miners. These sectors have suffered from smuggling, under-reporting and exploitation by foreign intermediaries.',
                    'New mines and processing facilities would be Zambian-owned, and existing operations would supply local factories producing refined gold bullion, washed manganese ore and cut-and-polished gemstones for direct export, with Chinese and American partners bringing polishing and jewellery-making technology.',
                ],
            },
        ],
        quote: 'From the villages of Luapula to the hills of Southern Province, our gemstones, gold and manganese will lift families, fund schools and build clinics — because the wealth will belong to the people who own the land.',
    },
    {
        slug: 'decentralised-governance',
        title: 'Decentralised Governance',
        icon: 'fa-solid fa-landmark',
        short: 'A three-sphere system of national government, provincial parliaments and local councils, so decisions are no longer trapped in Lusaka.',
        metaDescription: 'Build One Zambia’s proposal for decentralised governance: national government, new provincial parliaments and strengthened local council chambers.',
        summary: {
            issue: 'Decision-making is concentrated in Lusaka.',
            why: 'Centralised power makes governance less responsive, less inclusive and less accountable to communities.',
            approach: 'Establish three spheres — national, provincial and local — with distinct mandates, including new provincial parliaments in all ten provinces.',
            outcome: 'Stronger local voices, greater public trust and tangible benefits such as energy independence and better services.',
        },
        intro: [
            'Build One Zambia is committed to decentralising power to make governance more responsive, inclusive and accountable. The proposal is a three-sphere system — national, provincial and local — with clear and distinct mandates to ensure efficiency and accountability at every level.',
        ],
        sections: [
            {
                heading: 'Three spheres of government',
                items: [
                    { title: 'National government', text: 'Responsible for national legislation, defence, foreign relations and macroeconomic strategy — uniting all provinces under one flag and one purpose.' },
                    { title: 'Provincial parliaments', text: 'Newly established in each of the ten provinces to manage regional development, from infrastructure and education to health and agriculture. The provincial leader would be appointed by the paramount chief, honouring traditional structures and keeping leaders rooted in and accountable to their communities.' },
                    { title: 'Local council chambers', text: 'Strengthened at municipal level to focus on the day-to-day services that matter most: water supply, sanitation, community facilities and local economic development.' },
                ],
            },
            {
                heading: 'Why this matters',
                text: ['The document argues that appointing provincial leaders through paramount chiefs combines modern governance with cultural heritage, reducing the risk of corruption and increasing public trust. With provincial parliaments, decisions would no longer be trapped in Lusaka, citizens’ voices would be stronger, and the benefits would be tangible.'],
            },
        ],
    },
    {
        slug: 'provincial-industry',
        title: 'Power, Fertiliser and Building Materials in Every Province',
        icon: 'fa-solid fa-bolt',
        short: 'A power plant, fertiliser plant, cement works and stone-crushing plant in every province.',
        metaDescription: 'Build One Zambia’s plan for a power plant, fertiliser plant, cement production and stone crushing in each of Zambia’s ten provinces.',
        summary: {
            issue: 'Load-shedding, costly imported fertiliser and expensive building materials hold back growth.',
            why: 'Every province needs reliable energy and affordable inputs to farm, build and create jobs.',
            approach: 'Build strategic industrial facilities in every province.',
            outcome: 'An end to load-shedding, higher agricultural productivity, affordable construction and thousands of jobs.',
        },
        intro: [
            'Alongside decentralised governance, Build One Zambia proposes strategic development in every province, so that the benefits of growth reach every region rather than a few centres.',
        ],
        sections: [
            {
                heading: 'In every province',
                items: [
                    { title: 'Power plants', text: 'Ten new power plants — one per province — to end load-shedding, deliver reliable electricity from dawn to dusk and support economic growth.' },
                    { title: 'Fertiliser plants', text: 'A production plant in every province to boost harvests, reduce dependence on imports and end food insecurity.' },
                    { title: 'Cement production', text: 'Local facilities for affordable, sustainable building materials that support construction and create lasting jobs.' },
                    { title: 'Stone-crushing plants', text: 'To supply construction and support the mining and infrastructure sectors.' },
                ],
            },
        ],
    },
    {
        slug: 'responsible-borrowing',
        title: 'Responsible Borrowing and Debt',
        icon: 'fa-solid fa-scale-balanced',
        short: 'Borrowing only for productive assets that generate export revenue — never for consumption or private contracts.',
        metaDescription: 'Build One Zambia’s debt strategy: targeted, asset-based borrowing for agricultural, road and housing equipment to address Zambia’s public debt.',
        summary: {
            issue: 'Zambia’s public debt stands at approximately USD 28.9 billion, according to the document.',
            why: 'Borrowing for consumption or private contracts deepens the burden without building national capacity.',
            approach: 'Targeted, asset-based borrowing for agricultural, road-construction and housing-construction equipment.',
            outcome: 'Self-sustaining growth, dignified employment and an end to the cycle of unsustainable debt.',
        },
        intro: [
            'Every great journey begins with a single, deliberate step. Build One Zambia describes its first steps as small and strategic — changes that may appear modest but are intended to leave a profound impact on the country’s future.',
            'The document puts Zambia’s public debt at approximately USD 28.9 billion. It argues that addressing this burden sustainably demands discipline: borrowing only for productive investments that generate export revenue and improve the lives of ordinary Zambians — never for consumption or private contracts.',
        ],
        sections: [
            {
                heading: 'Asset-based borrowing that builds national capacity',
                bullets: [
                    'Agricultural equipment to empower small-scale farmers, improve food security and grow agricultural exports.',
                    'Road-construction equipment to strengthen municipal infrastructure and end the tender system that has enabled corruption and the misuse of public funds.',
                    'Housing-construction equipment to speed up the delivery of affordable homes in fast-growing cities.',
                ],
                after: ['By prioritising productive assets over consumable spending, the strategy aims to drive self-sustaining growth, create dignified employment and break the cycle of unsustainable debt.'],
            },
            {
                heading: 'The path forward',
                text: ['Realising this vision requires experienced politicians, skilled professionals and dedicated leaders able to drive economic transformation and infrastructure development. Build One Zambia commits to assembling that expertise — youth, leaders and communities acting together today for a thriving, equitable tomorrow.'],
            },
        ],
    },
];

// Transport sub-pages (served at /infrastructure/:slug, as specified in the source document).
export const infrastructure = [
    {
        slug: 'roads',
        title: 'Roads',
        icon: 'fa-solid fa-road',
        headline: 'A roads revolution — built by Zambians for every community',
        metaDescription: 'Build One Zambia’s 2026–2031 road commitments: dual-carriageway corridors, provincial priorities, district roads, urban ring roads and local road materials.',
        intro: 'Smooth, all-weather roads connecting villages to markets and districts to provincial capitals — no more potholes damaging vehicles or isolating families in the rainy season. The commitment is high-quality, climate-resilient roads built directly by Zambians using government-provided machinery.',
        commitmentsLabel: 'Core commitments (2026–2031)',
        commitments: [
            'Upgrade national economic corridors to dual carriageways — Lusaka–Ndola, Lusaka–Livingstone, the Great North Road to Nakonde and more — using Zambian-operated equipment and labour.',
            'Provincial priorities: the Mutanda–Kaoma corridor in Western Province, Lobito Corridor feeder links, farm-to-market roads in Central Province, mining haul routes on the Copperbelt, and Eastern Province trade links to Malawi and Mozambique.',
            'All-weather paved or durable gravel roads in every underserved district, particularly in rural Luapula, Muchinga, Northern and North-Western Provinces, so farmers can move produce to market quickly and affordably.',
            'Ring roads and decongestion projects in provincial capitals: Lusaka, Ndola, Kitwe, Livingstone, Chipata, Solwezi, Mongu, Kasama and Mansa.',
            'Local production of road materials through quarries and asphalt plants, to lower costs and create employment.',
        ],
        benefits: 'Shorter journeys, lower transport costs, thousands of construction jobs at fair wages, fewer vehicle breakdowns and safer travel every day.',
    },
    {
        slug: 'rail',
        title: 'Rail',
        icon: 'fa-solid fa-train',
        headline: 'Reviving our railways — Zambian workers rebuilding the backbone of the economy',
        metaDescription: 'Build One Zambia’s rail commitments: rehabilitating ZRL lines, reviving TAZARA, new extensions including Chingola–Angola, freight spurs and passenger stations.',
        intro: 'Rail is the most cost-effective and environmentally responsible way to move heavy loads, yet the network has been neglected for decades. Build One Zambia would revitalise it with Zambian workers operating machinery, laying rails and running trains — moving cargo off overloaded roads and restoring reliable passenger services.',
        commitmentsLabel: 'Core commitments',
        commitments: [
            'Government-led rehabilitation of Zambia Railways Limited (ZRL) lines — new track, modern signalling, locomotives and wagons — built and maintained by Zambian teams, with foreign expertise brought in only for skills transfer.',
            'Faster revival of TAZARA through individual specialists rather than foreign contractors, expanding export capacity to Dar es Salaam.',
            'New extensions: Chingola–Angola (Lobito Corridor), Northern Province links, and commuter lines connecting Lusaka and the Copperbelt for daily workers.',
            'Freight spurs to mining areas in the Copperbelt and North-Western Provinces, agricultural sidings in Central and Eastern Provinces, and passenger stations across Luapula, Muchinga, Southern Province and beyond.',
            'Local sourcing of rails, sleepers and ballast, and upgraded fuel depots.',
        ],
        benefits: 'Lower export costs for copper, cobalt, maize and fertiliser; fewer truck accidents and less road damage; reliable, environmentally friendly transport; and thousands of jobs in rail construction, operations and maintenance.',
    },
    {
        slug: 'cargo-airports',
        title: 'Cargo Airports',
        icon: 'fa-solid fa-plane-arrival',
        headline: 'A cargo powerhouse — exporting Zambia’s wealth from every province',
        metaDescription: 'Build One Zambia’s cargo airport commitments at Kenneth Kaunda, Simon Mwansa Kapwepwe, Mfuwe, Livingstone and Solwezi, plus Airport City projects.',
        intro: 'As a landlocked country, Zambia depends on fast, reliable air cargo to reach global markets with fresh produce, flowers, fish and high-value minerals. Cargo facilities would be expanded, with Zambian workers leading construction.',
        commitmentsLabel: 'Core commitments',
        commitments: [
            'A major cargo terminal expansion at Kenneth Kaunda International Airport, Lusaka — cold-chain facilities, warehouses and freighter aprons — built by local teams.',
            'Upgrades at Simon Mwansa Kapwepwe International Airport, Ndola, to serve Copperbelt mining and industrial exports.',
            'Provincial improvements at Mfuwe (Eastern Province agro-tourism), Livingstone (Southern), Solwezi (North-Western mining) and key sites in other provinces.',
            'Airport City projects in Lusaka and Ndola: logistics parks and agro-processing zones generating local employment.',
            'Local materials and Zambian labour for all runways, taxiways and terminal buildings.',
        ],
        benefits: 'Rural farmers can sell fresh produce without spoilage, mineral exporters reach markets faster, new logistics and processing jobs emerge, and Zambia becomes a leading regional cargo hub — with the wealth staying in Zambian hands.',
    },
    {
        slug: 'passenger-airports',
        title: 'Passenger Airports',
        icon: 'fa-solid fa-plane-departure',
        headline: 'Wings for all Zambians — connecting provinces and opening up opportunity',
        metaDescription: 'Build One Zambia’s passenger airport commitments: modernising Kenneth Kaunda and Harry Mwanga Nkumbula airports, provincial airports and regional routes.',
        intro: 'Better airports make it easier to travel for business, family visits, tourism and investment, ending long and costly road journeys to reach loved ones or opportunities.',
        commitmentsLabel: 'Core commitments',
        commitments: [
            'Full modernisation of Kenneth Kaunda International Airport, Lusaka — larger terminals, upgraded facilities and more routes — built by Zambian workers.',
            'Upgrades to Harry Mwanga Nkumbula International Airport, Livingstone, to serve growing tourism at Victoria Falls.',
            'New and refurbished provincial airports at Choma, Kasaba Bay and Nakonde, with major improvements at Mansa (Luapula), Mfuwe (Eastern), Solwezi (North-Western), Mongu (Western) and others.',
            'Better domestic and regional routes to Johannesburg, Dar es Salaam and Nairobi, with improved accessibility and safety features.',
            'Zambian-led construction using locally sourced materials throughout.',
        ],
        benefits: 'Affordable flights for family visits, a thriving tourism industry across national parks and cultural sites, easier access for investors, and growth that reaches remote provinces, including Western, Northern and Muchinga.',
    },
];

// About Build One Zambia — membership, aims, objectives and policy.
export const organisation = {
    about: [
        'At the heart of Build One Zambia is a simple conviction: when Zambians work together, there is nothing they cannot achieve.',
        'Its leadership is committed to listening — especially to Zambia’s youth, the generation that will shape tomorrow — understanding their needs, amplifying their ideas and connecting them with experienced leaders who can help turn vision into reality.',
        'Build One Zambia believes that genuine collaboration between young people and seasoned leaders is the key to unlocking Zambia’s potential and securing a brighter, more prosperous future for every citizen.',
    ],
    membership: 'Membership of Build One Zambia (BOZ) is open to every Zambian aged 18 or older, regardless of tribe, race, colour or creed, who accepts its principles, policies and programmes.',
    aim: 'To build a united, non-tribal, non-racial, non-sexist and democratic society.',
    objective: 'To improve the quality of life of all Zambians, with particular focus on the poorest and most vulnerable.',
    policy: 'The Constitution of Zambia remains the foundational policy document of Build One Zambia.',
};

export const symbol = {
    emblem: 'The emblem of Build One Zambia is a circle divided into green and orange halves, declaring unity, freedom and shared progress. At its centre are three icons: an excavator for construction and infrastructure, industrial buildings for manufacturing and economic growth, and a tractor for agriculture and food security — together representing a modern, self-sufficient Zambia built through collective effort.',
    unity: 'The interlocking halves represent Zambia’s diverse communities coming together — regardless of tribe, region, language or background — in a shared pursuit of freedom, fairness and national renewal, reflecting BOZ’s commitment to non-tribal, people-centred politics.',
    flag: 'The BOZ flag has three equal horizontal bands: black, green and gold.',
    colours: [
        { name: 'Black', hex: '#111111', text: 'Honours the resilient people of Zambia — citizens, workers, farmers and young people who have faced hardship and fought across generations for dignity, justice and freedom.' },
        { name: 'Green', hex: '#1F7A3A', text: 'Celebrates Zambia’s rich land and natural fertility — the soil that has sustained families for centuries, yet has too often been underused or exploited.' },
        { name: 'Gold', hex: '#D4A017', text: 'Represents the country’s mineral wealth — copper, emeralds and more — which belongs to all Zambians, not to a privileged elite or distant foreign interests.' },
    ],
    motto: 'Build One Zambia — for the people, by the people.',
};

// Ways to get involved (from "Join the Movement").
export const involvement = [
    { icon: 'fa-solid fa-people-group', title: 'Volunteer', text: 'Help organise in your province, district or ward.', link: '/volunteer', cta: 'Sign up to volunteer' },
    { icon: 'fa-solid fa-bullhorn', title: 'Spread the word', text: 'Share the Build One Zambia message with family, friends and your community.', link: '/advocacy', cta: 'Read the proposals' },
    { icon: 'fa-solid fa-tractor', title: 'Join a cooperative', text: 'Take part in the agricultural mechanisation programme.', link: '/advocacy/agricultural-mechanisation', cta: 'How cooperatives work' },
    { icon: 'fa-solid fa-check-to-slot', title: 'Vote Build One Zambia', text: 'Choose genuine progress at the ballot box.', link: '/contact', cta: 'Ask a question' },
];

// Supporter quotes as they appear in the source document.
export const supporterQuotes = [
    { text: 'As a farmer in Northern Province, the prospect of local fertiliser plants changes everything. No more prohibitive costs — just growth for my family and my community.', name: 'Mwansa K.', role: 'Farmer, Northern Province' },
    { text: 'This is the leadership Zambia has needed for generations. Equipping locals to build their own homes and run their own businesses — that is real, lasting progress.', name: 'Chanda M.', role: 'Supporter' },
];

export const getAdvocacy = (slug) => Advocacy.find((a) => a.slug === slug);
export const getInfrastructure = (slug) => infrastructure.find((i) => i.slug === slug);

export default Advocacy;
