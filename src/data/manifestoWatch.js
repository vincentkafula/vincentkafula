// Manifesto Watch — Build One Zambia's scrutiny of the UPND Manifesto 2026–2031.
// Source document: "UPND Manifesto 2026 — Zambia Forward, Together" (52 pages).
// Update `status`, `latest` and LAST_REVIEWED whenever new official figures are published.

export const LAST_REVIEWED = 'October 2026';

export const STATUS = {
    behind: { label: 'Behind pace', tone: 'red' },
    unmeasurable: { label: 'No baseline or deadline', tone: 'amber' },
    watching: { label: 'Progress so far', tone: 'green' },
};

export const headlineFacts = [
    { value: '15', label: 'headline targets in the UPND manifesto' },
    { value: '0', label: 'cost estimates for any of them' },
    { value: '27', label: 'times the plan depends on “the private sector”' },
];

// Our main arguments, built from what the manifesto itself says.
export const weaknesses = [
    {
        title: 'Promises without deadlines',
        text: 'The manifesto says every major commitment will have “clear timelines”. Yet its 15 headline targets carry almost no dates. Double the economy — by when? 2 million jobs — counted how, and from what starting point? A promise without a deadline cannot be broken, and that is exactly the problem.',
    },
    {
        title: 'Not a single cost figure',
        text: 'Pillar 5 claims every target will be “fully funded”. But the document never says what anything will cost, or where the money will come from. Ten thousand megawatts, six new universities, 500,000 hectares of irrigation — none of it is priced. Zambians are being asked to trust a budget they are not allowed to see.',
    },
    {
        title: 'Handing delivery to someone else',
        text: '“The private sector” appears 27 times. Jobs, power, irrigation, storage, mines, housing and water are all to be delivered “in partnership with the private sector”. If investors do not come, or do not hire Zambians, the promise quietly fails — and government will say the market decided. We believe the state must own the tools of development, not just invite others to use them.',
    },
    {
        title: 'Escape clauses written in',
        text: 'The maize target of 10 million tonnes is “subject to local and global demand”. Water tariffs are to become “cost-reflective”, which in plain language means higher bills. The cost-of-living section sets no price targets at all — not for mealie meal, fuel, electricity or rent.',
    },
    {
        title: 'Targets the numbers do not support',
        text: 'Copper must more than triple, from 890,346 tonnes in 2025 to 3 million tonnes — after missing the government’s own 1-million-tonne target for 2025. Wheat must grow more than twelvefold, from about 82,000 tonnes this season to 1 million. Average maize yields must rise from 1.7 to 10 tonnes per hectare. Ambition is good; arithmetic matters more.',
    },
    {
        title: 'The same old contract model',
        text: 'Roads, rail, power and mines are to be built through PPP concessions and joint ventures. This is the contract-and-tender system that has let middlemen and foreign firms take the profits while Zambian workers get little. More of the same will deliver more of the same.',
    },
];

// The UPND's 15 headline targets, scored.
export const promises = [
    {
        id: 1, pillar: 'Jobs and Opportunity', promise: 'Work with the private sector to create 2 million new jobs, with deliberate inclusion of youth and women.',
        baseline: 'Not stated in the manifesto. No definition of a “job” (formal or informal, permanent or temporary).', status: 'unmeasurable',
        problem: 'Without a starting figure or a way of counting, any number can be claimed in 2031. The jobs are also left to private companies, so government takes credit for hiring it does not control.',
        demand: 'Publish the 2026 employment baseline and an annual jobs count verified by the Zambia Statistics Agency Labour Force Survey, broken down by province, youth and women.',
        alternative: 'Government-owned machinery in every municipality, operated by Zambians, building homes, roads, schools and hospitals — direct jobs that government can count and guarantee.',
        link: '/service-single/Housing-and-Community-Infrastructure',
    },
    {
        id: 2, pillar: 'Jobs and Opportunity', promise: 'More than double TEVET enrolment, supporting 100,000+ young people with industry-linked training.',
        baseline: 'Current enrolment not stated.', status: 'unmeasurable',
        problem: '100,000 trainees over five years is small next to the number of young Zambians leaving school every year. Training without guaranteed work at the end simply moves the queue.',
        demand: 'State the current TEVET enrolment, the yearly target, and how many trainees actually move into paid work.',
        alternative: 'A technical and vocational college in every district, feeding graduates straight into a national public works programme operating machinery and building the country.',
        link: '/service-single/Housing-and-Community-Infrastructure',
    },
    {
        id: 3, pillar: 'Jobs and Opportunity', promise: 'Position Zambia as a regional manufacturing and industrial powerhouse.',
        baseline: 'No measurable target given.', status: 'unmeasurable',
        problem: 'This is a slogan, not a target. There is no figure for manufacturing output, factories opened or jobs created, so it can never be judged.',
        demand: 'Set a manufacturing share of GDP and a list of named industrial parks with opening dates.',
        alternative: 'Cement, fertiliser and stone-crushing plants in every province, and a rule that all ore is processed in Zambia by Zambian-owned companies.',
        link: '/service-single/Mining-Strategy',
    },
    {
        id: 4, pillar: 'Food, Farming and Lower Costs', promise: 'Raise maize production to 10 million tonnes (plus 3 million tonnes of soya beans and 1 million tonnes of wheat), “subject to local and global demand”.',
        baseline: 'Maize: about 4.94 million tonnes forecast for 2025/26, a record. Wheat: about 82,000 tonnes.', status: 'watching',
        problem: 'We welcome this season’s record harvest, helped by good rains. But the target nearly doubles maize again and needs yields six times higher than today, while wheat must grow more than twelvefold. The “subject to demand” clause lets the promise be dropped whenever prices fall.',
        demand: 'Remove the escape clause, publish yearly production targets for maize, soya and wheat, and report them each season alongside the Crop Forecasting Survey.',
        alternative: 'Tractors, harrows, planters and solar irrigation placed directly with 20-member farmer cooperatives that own their equipment — no middlemen.',
        link: '/service-single/Agricultural-Mechanisation',
    },
    {
        id: 5, pillar: 'Food, Farming and Lower Costs', promise: 'Bring 500,000 additional hectares under irrigation and modernise agriculture.',
        baseline: 'Current irrigated area not stated.', status: 'unmeasurable',
        problem: 'No cost and no yearly plan. Irrigation is again to be led by private investment, which goes first to large commercial farms, not small-scale farmers.',
        demand: 'Publish hectares irrigated each year, by province, and how many small-scale farmers benefit.',
        alternative: 'Subsidised solar-powered pumps, drip and sprinkler systems for farmer cooperatives, prioritising drought-prone districts.',
        link: '/service-single/Agricultural-Mechanisation',
    },
    {
        id: 6, pillar: 'Food, Farming and Lower Costs', promise: 'US$1 billion a year in beef exports and a national herd of 11 million cattle.',
        baseline: 'Herd size not stated; the manifesto only says the herd will “more than double”.', status: 'unmeasurable',
        problem: 'Disease-free zones and export certification take years to build. With no baseline and no deadline, the target cannot be tracked.',
        demand: 'Publish the current herd size, annual beef export earnings, and dates for each disease-free compartment.',
        alternative: 'Cooperative-owned equipment and local processing so livestock farmers, not traders, capture the value.',
        link: '/service-single/Agricultural-Mechanisation',
    },
    {
        id: 7, pillar: 'Power, Growth and Industry', promise: 'Double the size of Zambia’s economy (GDP).',
        baseline: 'No baseline and no target date.', status: 'unmeasurable',
        problem: 'Doubling within five years would need extraordinary growth every single year. The manifesto does not say when it will happen — so it never has to.',
        demand: 'State the GDP baseline, the target year and the annual growth rate government is planning around.',
        alternative: 'Growth built on assets Zambia owns: machinery, processing plants and power stations, financed only by borrowing for productive equipment.',
        link: '/about',
    },
    {
        id: 8, pillar: 'Power, Growth and Industry', promise: 'Expand electricity generation from around 3,400 MW to over 10,000 MW and permanently end load-shedding.',
        baseline: 'About 3,400 MW (manifesto figure).', status: 'unmeasurable',
        problem: 'Nearly tripling capacity in one term would be unprecedented, and it depends on private power producers whose tariffs Zambian households will pay. No plant list, no dates, no cost.',
        demand: 'Publish every power project with its megawatts, owner, tariff and commissioning date, and report load-shedding hours each month.',
        alternative: 'Ten new public power plants — one in every province — plus generation capacity in every district.',
        link: '/',
    },
    {
        id: 9, pillar: 'Power, Growth and Industry', promise: 'Grow copper production to 3 million tonnes.',
        baseline: '890,346 tonnes in 2025, short of the 1-million-tonne target set for that year.', status: 'behind',
        problem: 'Output must more than triple. Even if it does, the plan still lets most copper leave as raw concentrate and cathode — so Zambia exports the jobs along with the ore.',
        demand: 'Publish quarterly production by mine and the share of copper processed into finished products inside Zambia.',
        alternative: 'All new mines 100% Zambian-owned; existing mines sell their output to Zambian processing companies that make wire, cable and battery components here.',
        link: '/service-single/Mining-Strategy',
    },
    {
        id: 10, pillar: 'Opportunities in Every Province', promise: 'A public university in every province that lacks one — named as Luapula, Northern, North-Western, Western, Southern and Eastern.',
        baseline: 'Six provinces named; no sites, budgets or opening dates.', status: 'unmeasurable',
        problem: 'Six universities in five years with no money set aside is a promise that is easy to make and easy to delay.',
        demand: 'Name each site, its budget and the year it will admit its first students.',
        alternative: 'A University of Zambia campus in all ten provinces, with faculties matched to each region’s strengths.',
        link: '/service-single/Housing-and-Community-Infrastructure',
    },
    {
        id: 11, pillar: 'Opportunities in Every Province', promise: 'Strengthen decentralisation so growth reaches every province and district.',
        baseline: 'No measurable target.', status: 'unmeasurable',
        problem: 'Every government promises decentralisation. Without transferring real tools and budgets to councils, nothing changes on the ground.',
        demand: 'Publish how much money and equipment each council controls directly, every year.',
        alternative: 'Heavy machinery owned by every municipality, so councils can build without waiting for tenders from Lusaka.',
        link: '/service-single/Decentralised-Governance',
    },
    {
        id: 12, pillar: 'Opportunities in Every Province', promise: 'Give each province a specialist economic identity based on its resources.',
        baseline: 'No measurable target.', status: 'unmeasurable',
        problem: 'Labels do not build factories. The manifesto names no industry, investment or job figure for any province.',
        demand: 'Publish each province’s designated sector and the projects funded under it.',
        alternative: 'Fertiliser, cement and power plants in every province, so each one produces for itself.',
        link: '/service-single/Housing-and-Community-Infrastructure',
    },
    {
        id: 13, pillar: 'Cleaner, Faster Government', promise: 'Develop key urban centres and border areas into 24-hour economic hubs.',
        baseline: 'No towns named.', status: 'unmeasurable',
        problem: 'A 24-hour economy needs 24-hour power. Until load-shedding ends, this promise depends entirely on target 8.',
        demand: 'Name the hubs and the date each one will open.',
        alternative: 'Reliable provincial and district power first — then round-the-clock trade follows.',
        link: '/',
    },
    {
        id: 14, pillar: 'Cleaner, Faster Government', promise: 'Digitise government services, national identity, land registry, business registration and tax administration.',
        baseline: 'No timeline given.', status: 'unmeasurable',
        problem: 'Worth doing — but digitising the land registry and national ID without strong data protection puts citizens’ information at risk.',
        demand: 'Publish which services go online each year and how citizens’ data will be protected.',
        alternative: 'Digital services built and run by Zambian engineers, with citizens owning their records.',
        link: '/service-single/Decentralised-Governance',
    },
    {
        id: 15, pillar: 'Cleaner, Faster Government', promise: 'Advance economic diplomacy and make Zambia a preferred investment and tourism destination (5 million visitors, a US$2 billion tourism sector by 2031).',
        baseline: 'Over 2 million visitors in 2025 (manifesto figure).', status: 'unmeasurable',
        problem: 'Attracting foreign investors is not the same as creating Zambian owners. The plan measures how welcome outsiders feel, not how much Zambians own.',
        demand: 'Report tourism earnings and how much of the sector is Zambian-owned.',
        alternative: 'Tourism hotels owned and run by Zambian entrepreneurs, and better provincial airports to bring visitors to every region.',
        link: '/service-single/Transport-Infrastructure',
    },
];

// How Build One Zambia will hold the government to its word.
export const accountabilitySteps = [
    { title: 'A public scorecard', text: 'This page tracks every one of the 15 targets against official figures, and is updated every quarter.' },
    { title: 'Ask for the numbers', text: 'We will write to the responsible ministries asking for the baselines, budgets and timelines the manifesto promised, and publish their answers — or their silence.' },
    { title: 'Questions in Parliament', text: 'We will work with Members of Parliament willing to table questions on each target, so ministers must answer on the record.' },
    { title: 'Reports from every ward', text: 'Members and volunteers in all 1,858 wards can report what is — and is not — happening where they live, using the form below.' },
    { title: 'An annual Promise Report', text: 'Every August, on the anniversary of the 2026 election, we will publish a full report on what was delivered and what was not.' },
];

export const sources = [
    { label: 'UPND Manifesto 2026 — “Zambia Forward, Together” (52 pages)', url: 'https://www.upnd.co.zm' },
    { label: 'Al Jazeera — Hichilema wins second term (18 August 2026)', url: 'https://www.aljazeera.com/news/2026/8/18/zambias-hichilema-wins-second-term-as-president' },
    { label: 'Ecofin Agency — 2025 copper output rises 8%, misses 1 million-tonne target', url: 'https://www.ecofinagency.com/news-industry/2801-52339-zambias-2025-copper-output-rises-8-misses-1-million-tonne-target' },
    { label: 'Zambia Monitor — 2025/26 Crop Forecasting Survey: 4.94 million tonnes maize, 81,822 tonnes wheat', url: 'https://www.zambiamonitor.com/?p=86922' },
];
