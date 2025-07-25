//=======================================================================================
//================================   LA_build_wordlist.js   =============================
//=======================================================================================
"use strict";

const fs = require('fs');

// https://github.com/cltk/latin_proper_names_cltk/blob/master/proper_names.txt
let filepath = "./LA_wordlist.txt";

let wordlist    = [];
let word_count  = 1;
let PREFIXES    = [];
let new_words   = [];

const la_data = fs.readFileSync(filepath, { encoding: 'utf8', flag: 'r' });

const LA_MNEMONICS = [ 
	"aaron","abale","aban","abarim","abas","abatos","abbassium","abda","abdera","abdicans","abducta","abegit","abel","abgarum","abho","abiete",
	"abila","abin","abiorum","abisarae","abla","abnobae","abobrica","abolitionem","aborior","abra","abretteni","abruptum","absarru",
	"absconditus","absentia","absit","absoluta","abstracte","absyrti","abuccius","abudius","abulites","aburnium","abyd","abysrtus","abzoae",
	"academica","acamans","acanthida","acar","acasten","acbari","acca","accessum","accipere ","accommodare","accusatis","acelum","acen","acer",
	"acesimbroto","achae","ache","achil","acholium","achra","acidum","acies","acii","acila","acin","acirim","acis","acme","acmon","acoeten",
	"acon","acorea","acrae","acri","acro","acta","acte","actio","actor","actumero","aculeo","acus","acuti","acyl","acyta","adae","adamas",
	"adanu","addere","addicto","adducere","adel","adeptio","adgandestrii","adher","adhibent","adhuc","adia","adimantum","adipisci","aditum",
	"adiuvaret","admeti","administratio","admonere","adnotatione","adon","adoptauit","adoreo","adpo","adra","adria","adrobricam","adrumetina",
	"adryasin","adtende","aduenam","adultus","adumbratim","aduo","advantage","adversarius","advocatus","adyrmachidae","aeac","aeaea","aean",
	"aeas","aebura","aeci","aeco","aeculanum","aedemone","aedificate","aedone","aedronem","aedui","aeeta","aeficio","aefulae","aega","aege",
	"aegi","aegl","aegoceri","aegrotatio","aegusam","aegy","aelamitae","aeli","aello","aemi","aemulus","aenaria","aenea","aeni","aeno","aenum",
	"aeol","aepulo","aepy","aequalis","aerarium","aerem","aeriam","aeroportus","aesacon","aeschine","aesepia","aesim","aeso","aesquilinum",
	"aestas","aetas","aeternum","aethaliam","aetia","aetna","aeto","aeuom","afella","afer","affulget","afinio","afra","african","afro","afrum",
	"agacl","agame","aganip","agapenoris","agartus","agassas","agathan","agaue","agedinci","ageladae","agentis","agepolim","agere","agesilae",
	"aggar","agger","agin","agipsum","agis","agitur","aglaie","agmine","agnae","agnoscis","agonacen","agoracriti","agra","agre","agri",
	"agroecus","agru","agunt","agusium","agyieu","agyl","agyri","ahala","aharnam","aheno","aiace","aiathuri","aiax","aietius","aiiacem",
	"aithaleti","aius","aizi","alaban","alae","alalcomenaea","alamannia","alandri","alastoraque","alatreus","alauda","alazona","alba","albe",
	"albi","albo","album","alcaei","alce","alci","alcmaeo","alco","alcumena","alcyonae","aleae","alebiona","alecto","aledio","alei","alelen",
	"alemanni","aleon","aleria","ales","alete","aleuae","alex","alfenam","alfio","algalsus","algentemque","algi","aliaeu","alibi","alicio",
	"alide","aliena","alimentus","aliorum","aliphera","aliquid","alisone","aliter","alium","allegatio","alli","allo","allucio","almam","almo",
	"aloeus","aloidae","alope","alorco","alpe","alpha","alpi","alsiense","alsum","altam","alter","alth","altiore","altogether","altum","alutae",
	"alyatte","alyzia","amabilia","amadoco","amafinii","amal","amantis","amare","amase","amata","amaxobioe","amazon","ambarros","ambenus",
	"ambitio","ambo","ambracia","ambulate","amenanus","american","amestratini","amet","amfion","amiano","amica","amilcar","amin","amisiae",
	"amittere","ammiano","ammo","amnem","amnis","amoenus","amometus","amor","ampelisca","amph","ampiae","amplexum","ampsaci","ampyci","amtorgim",
	"amul","amunclanum","amusicus","amyci","amydone","amymneorum","amyn","amyron","amyth","anabura","anac","anaeticam","anagnia","analogia",
	"anam","ananim","anaphen","anarcharsis","anas","anatiliorum","anauros","anax","anazarbeni","anca","anchora","anci","anco","ancum","ancyra",
	"andaniam","ande","andibus","andociden","andron","anemo","angelus","angiportum","anglicus","angriuarii","anguli","anhelitus","aniceti",
	"anien","anigrus","anii","anima","anio","anium","annales","anniversarium","annotata","annus","anquillaria","anser","antaei","ante","anthea",
	"antiqua","anto","antronas","antulla","anubidis","anus","anxa","anxietas","anxur","anxyr","anyti","aona","aones","aoni","aornin","aorsi",
	"aoum","aous","apama","apartaeos","apaturii","apauortene","apelaurum_stymphaliae","apennini","aperta","aphaeae","apheliotae","aphidas",
	"aphobetum","aphro","aphthirem","apicem","apidani","apim","apin","apio","apis","apitami","aple","apocalypsi","apodotosque","apoecide",
	"apol","aponi","appen","appi","applicare","appuleia","apragopolim","aprem","aprilis","apro","aprum","apseudes","apso","apsum","apsyrtos",
	"apta","apteron","apuani","apud","apul","apuscidamo","aqua","aquila","arabum","aracelium","aradi","arae","aram","araque","arar","aras",
	"aratea","arauricus","araxe","arbace","arbela","arbilam","arbor","arbuscula","arcanum","arce","archimagirus","arciam","arcobarzane",
	"arcti","arcus","ardae","ardeat","ardoneas","ardua","ardye","aream","arecomicorum","arei","arelate","aremoricae","arena","areo","arescusa",
	"aret","areuanias","arga","argenti","argi","argo","arguere","argyna","aria","arici","aridis","arieneos","arignotus","arimaspe","arinates",
	"ario","aris","arium","armamini:","arme","armi","armorum","armua","arna","arne","arni","arno","arnum","aron","arosapen","arpano","arpi",
	"arpocran","arquitene","arraei","arre","arrhida","arri","arrotrebarum","arrun","ars","arsace","arsen","arsi","arta","artem","arthetauri",
	"articulus","artocen","artus","artynia","aruacos","aruerni","aruina","aruleni","arupinis","arusacen","arybba","arycanda","asachae",
	"asanam","asara","asbolos","asbyte","asca","ascheton","asci","ascla","asconio","ascra","ascuam","ascylti","asdrubal","asel","asia","asici",
	"asida","asilae","asinus","asis","asitium","asius","asnaum","asopi","aspaganos","aspeliam","asphaltite","aspim","aspre","assacano",
	"asserta","assignato","asso","assy","astabores","astera","astigi","astoboam","astrologus","astu","asty","asudio","asuui","asyli","atabuli",
	"atace","ataeo","atalanta","atanagrum","atargatis","atax","ategua","atei","atel","aterni","atesi","atha","athe","athin","athleta","atho",
	"athy","atia","atidio","atii","atili","atimeto","atina","atisim","atizyes","atlans","atmosphaeram","atossam","atra","atrea","atrium","atro",
	"atta","attentio","atthida","atti","attollere","attrahunt","attum","atuatucam","atussa","atye","atym","atyn","atypo","atyras","atys",
	"auaritia","auchates","auctoritas","aucus","audax","audere","audire","aueiae","auel","auem","auens","auerna","auferetur","augere","augusta",
	"aurantiaco","aureum","auris","aurora","aurum","auscultatio","aut","autem","auxilium","avia","avis","avunculus","avus","bacteria",
	"balaena","balneo","balteus","bastardis","batavica","bellum","bene","benignus","bestia","bibere","bibliotheca","bid","bigas","bis",
	"bonitas","bonum","boost","booz","botri","bovis","breve","brunneis","bubulae","buccina","bulla","butio","butyrum","cacas","cachinno",
	"cacumen","cadere","caecus","caedes","caelum","caeruleum","caestu","calamum","calceus","calefactio","calidum","callidus","calor","calvaria",
	"camera","campus","can","cancer","candidatum","canis","canticum","cap","capax","capiens","caprae","captiosus","caput","cara",
	"carbohydratorum","carcerem","card","carentiam","caritas","carmen","carnes","carpere","carta","carve","caseus","castra","casus",
	"catena","catholica","catino","cattus","cauda","causam","cautionum","caverna","cecidimus","cede","celer","cellulam","cena","census",
	"centrum","ceo","cepa","cerebrum","cerritulus","certus","cervisiam","cessare","chaos","charta","chorda","christian",
	"chronica","cibus","cimex","cincinno","cinis","circum","cisternina","cithara","citius","cito","citrea","civitas","cladis","clamare",
	"clara","classem","claudere","clava","clericus","clibano","clientis","coctione","code","coegi","coeptis","cogens","cogitare",
	"cognata","cohors","collegium","columnae","combination","comitatus","comoedia","comprehendo","conatus","concilium","conditione",
	"confractus","congressus","coniectura","conlationem","conpono","consequuntur","contra","conversationem","cooperante","copia",
	"copulabis","coquus","cor","corium","cornu","corona","corpus","correspondente","cotidie","coxae","cras","creatio","creditis",
	"creo","crepito","crescere","crimen","critica","crudelis","crustulum","crystallo","cubiculum","cuius","culina","culpa","cultura",
	"cuniculum","cupio","cura","curiosus","curre","cursoriam","curva","custodire","daemonium","damnum","dapibus","dare","data","datum",
	"debes","debitum","decernere","declines","defaltam","defensio","definire","deformis","deinde","delectamentum","delictum","demanda",
	"demonstrabo","denique","densissima","dente","denuntiatio","deorsum","depingere","deprehendere","describere","desertum","desperatis",
	"destitutione","detrahere","deus","devita","diabolus","diam","diarium","dicentis","dicitur","dico","dictu","dicunt","differentia",
	"digitus","dignitas","dilectus","diligenter","dimensio","dimidium","director","dirigentes","dis","discipulus","disputatio",
	"disrumpam","dissentio","distributio","diurna","diversum","divisio","divortium","doceo","documentum","dolium","dollarium","dolor",
	"domesticis","domine","donatio","donec","donor","donum","draco","dubium","ducens","ducibus","duco","ductus","dulcis","dum","duo",
	"duodecim","duratus","durum","dux","ecclesia","echo","economist","ecosystem","eculeo","editor","educatione","effectus","efficax",
	"effugium","eget","ego","egregius","egritudo","eius","electio","elegans","elementum","elephanti","eligere","elit","emendatio",
	"emissione","emptum","enutriet","eorum","eos","equitare","equus","era","ergo","eros","erucae","escam","esse","esuriens","etc",
	"ethica","ethnici","etiam","euismod","eum","evanescet","evidenter","evolutio","exacte","exceptio","excitatur","excludere",
	"excogitatoris","excutite","executio","exemplum","exercitus","exhauriebat","exhibere","exigeretur","exitus","exolvuntur",
	"experiri","explicare","expositio","exsecutiva","exspectatio","exstructos","exsupero","extra","faba","fabricatio","fabula",
	"facere","faciem","facultatem","falsus","fame","familia","fan","fantasy","fasciculum","fashion","fastigio","fateri","fatum",
	"faucium","februarius","femina","femur","fenestra","fere","feriatum","fero","ferrum","fertilis","fictio","fidem","fiduciam",
	"fieri","fiet","figura","filius","filum","finalem","finis","firmo","fiscus","fixum","flagitium","flamma","flavum","flecte",
	"flexibile","flos","fluctus","fluidum","flumen","focus","fodere","foederati","folium","fons","foramen","foris","forma",
	"fornicatur","fortasse","forum","frater","fretus","fricare","frigus","fructus","frui","frumentum","frustum","fuga","fugent",
	"fugit","fulgur","fullonum","fumo","functionis","fundamenta","funem","funis","funus","fur","furantur","furca","furta","futurae",
	"galeati","gallico","gaudeo","gehenna","gelida","geminus","generalis","genius","gentem","genus","gere","germana","gesturum",
	"glacies","gladio","gloria","gradus","graeca","gramen","gravis","griseo","gubernator","guido","gustum","habet","habitans",
	"haec","hamo","haurire","hebdomadis","hedum","hendrerit","herba","hereditatem","heri","heros","heus","hibernica","hic",
	"hiems","hircum","hirundo","historia","hoc","hodie","hominem","honestus","honoris","hora","hormona","horologium","horribilis",
	"hortus","hospitium","huc","humero","humus","hydriam","hypotheca","iaccam","iactare","iaculat","iam","ianua","iaponica","ibi",
	"ictu","idem","idoneitatem","iecur","ignis","illae","illi","illud","imago","imbrem","immunis","imo","impar","imperium",
	"implicari","imponeret","impressionem","impulsum","inanis","inauditum","incessus","inchoare","incipere","includit","incrementum",
	"inculto","independens","indicant","industria","inepta","inevitabilis","inexplicitus","infans","inferius","infirmum",
	"influentia","informationes","infra","ingens","ingressum","inimicus","iniuriam","injuriam","inniti","innocens","inopinatum",
	"inordinatio","inpensa","inquisitio","insanis","inscriptio","insectum","insisto","insolitam","inspíra","institutio","insulam",
	"inter","into","intrabit","intus","inundatio","inutilia","invadendi","invenire","involvere","iocus","ipsa","ipsi","ipsum","ira",
	"iratus","ironiam","irrumabo","israelis","ita","item","iterum","itinerantur","iudex","iudicium","iugis","iuncturam","iuris",
	"ius","iustus","iuvenis","joculamentum","judicium","labium","laborem","lac","lacinia","lacrimam","lacus","laetificet","lagenam",
	"laminam","lanista","lapis","lapsus","laquearia","larva","lata","late","latin","latus","lauandi","lauda","lava","lectulo","leg",
	"legere","legio","legum","lenta","leo","leporem","lepus","levare","leviter","lex","liber","libum","licet","licuit","ligare",
	"lignum","ligulae","lima","lingua","linteum","liquescimus","litore","littera","litus","loci","loco","locus","logicae","loqui",
	"lorem","luceat","lucrum","luctuosa","ludere","ludio","ludo","ludum","luna","lutum","lux","lycopersici","machina","macula",
	"maesta","magister","magna","maior","malignitas","malleus","malus","manducare","manere","mangone","manifesto","mansuetum",
	"manus","marcam","mare","marine","martis","masculum","masticando","mater","matrimonium","maxime","medium","mel","melior",
	"membrum","memento","memoria","mendacium","mensis","merentur","mergi","meridiem","metam","methodo","metimur","micare",
	"migratum","militum","mima","minimus","minor","mirantibus","mirum","misce","misericordia","mitis","mitte","mixtisque",
	"modicum","modo","modus","molestum","mollis","momentum","moneo","monitus","mons","monumentum","moralis","morbus","mordere",
	"mores","mori","mortem","motivum","motricium","motus","mox","mulier","multi","mundus","muniat","murus","mus","musa","musculus",
	"museum","musti","mutatio","mutuari","mysterium","narrationis","nasus","natalis","nationalibus","natrium","natura",
	"navale","navis","necessitudo","negare","neglecturum","negotium","neminem","neque","neutrum","nexum","nidum","nigreos",
	"nihil","nimirum","nisi","nitri","nix","nobis","nocte","nod","nolunt","nomen","nominatim","non","nonprofit","normalem",
	"northmanni","nos","nostrum","not","nota","notitiam","november","novissime","novus","nox","noxa","nubere","nuclei",
	"nudant","nudus","nullus","numerus","numisma","nummum","numquam","nunc","nuntium","nuper","nupta","nusquam","nutrix",
	"obice","oblatio","oblivisci","obsido","obstante","occasum","occidere","occursum","oceanum","octo","oculus","odium",
	"oeconomica","officium","oleum","oliva","ollam","olympiae","omne","omnis","onus","operarius","opinionem","oportet",
	"oppidum","opportunitas","opprimo","opt","optimum","opulentos","opus","oraculi","oram","oratio","orci","ordinarius",
	"ordo","orientem","oriri","ornare","osculum","ossis","ostende","ostium","otiosum","otium","ovis","ovum","oxygeni",
	"pacificus","pactum","paenitet","pallidus","panem","paratus","parco","parente","pari","parlamentum","pars","parvus",
	"pascere","pater","patitur","patriam","pauci","paulatimque","pauperis","pavimentum","pax","peccatum","pectus",
	"pecunia","pedites","pellis","penitus","pensione","per","perdere","perficientur","periculum","perpendere","personale",
	"pervenire","petasum","petitio","phaenomenon","pharmacum","physicus","piano","picis","picturam","pilae","pingere",
	"pirata","piscis","pistris","pittacium","pius","placitum","plaga","planum","plaustra","plenus","plerumque","plumbum",
	"plus","pluteo","pluvia","poculum","podex","poena","poetica","pollicis","polus","pompeius","pondus","ponere","pontis",
	"popina","populus ","porcus","porta","positione","possibilitate","poterat","potius","praeses","prandium","pratum",
	"praxi","preceptum","premere","pretium","primis","princeps","prior","pristini","privatus","probabiliter","productum",
	"proelium","prohibere","proiectura","promptus","propellente","prorsus","prospectus","protinus","pudet","pudor","puella",
	"pueri","pugna","pulchra","pullum","pulmentum","pulset","pulvis","punire","pupa","purpura","putant","quadrata","quaeritur",
	"qualitas","quam","quando","quare","quattuor","queri","quibus","quicumque","quiete","quinque","quis","quo","quod",
	"quomodo","quoniam","raeda","ramus","rapax","rapere","rapina","raro","ratio","reactionem","realistica","recens",
	"recipis","recludet","recta","recuperare","redde","redemptore","reditus","reducere","reflectunt","reformacione",
	"regio","regnum","regularis","relatione","relinquo","rem","remedium","renovatio","renuntiationes","reparare","repetere",
	"reponere","reprehendo","repudium","rerum","res","responsum","restituere","resumere","rete","retro","reus","revelare",
	"rex","rhetorica","ridiculam","rigida","ripae","risu","rituale","robora","rogationis","rosa","rota","rubrum","rubus",
	"rudis","ruinare","rumpitur","rupes","ruptis","rusticus","ruunt","sabbatum","sacculum","sacerdos","sacrum","saeculum",
	"saepe","sagitta","sal","salarium","salmo","saltator","salutem","salvare","sana","sanctus","sanguis","sanitas","sanus",
	"sapientia","sarcina","satis","satus","saxum","scabere","scaena","scalae","scamnum","scapha","scelus","schedula","schola",
	"scientia","scilicet","scintilla","scire","scribe","sculptura","scutum","secare","secreto","sectionem","secundo",
	"sed","seges","sella","sem","semel","semita","semoto","semper","senator","senes","senior","sensus","sentire","seorsum",
	"separatum","sepelite","septentriones","sequor","seres","seriem","serpens","serva","sescenti","sese","sessionem",
	"sex","sextus","sexus","sibi","sic","sicco","sicut","sigillum","significans","silentium","silva","similis","simplex",
	"simul","singula","sinistram","sinus","situla","societas","solaris","solebant","solis","sollicitus","solo","solum",
	"solvere","somnium","sono","sonus","sordidum","soror","spatium","speciale","spes","sphaera","sphera","spiritus",
	"splendidis","spoliare","sponsor","stabit","stadium","stagnum","stans","status","stella","stem","stilla","stimulus",
	"stipendium","stomachum","stratum","stricto","studium","stultus","stuprum","suadeant","suaviter","sub","subeunt",
	"subito","subjecto","submittere","subruere","substantia","subtilis","suburbium","sucus","sudore","suffragium",
	"suggestum","sui","sum","summus","sumptuosus","supposita","supra","surculus","surgere","susceptor","suspendisse",
	"sustineri","susurri","suum","symbolum","systema","tabaci","tabernaculum","tabula","tace","tactus","taediosus",
	"talentum","tamen","tandem","tantum","tardus","tarso","tata","taurus","taxatio","tectum","televisionem","telum",
	"temere","tempus","tenaci","tenere","tenoris","tensio","tentorium","tenuistis","terebro","tergum","terminus","terra",
	"tertium","tessera","testimonio","theatrum","theloneo","theme","theoretical","thesaurus","tigris","timeo","timore",
	"tincidunt","tionibus","tironem","titulus","tolerare","torcular","tornacense","toro","torquent","total","totum",
	"toxicus","trabea","tractare","traditum","tragicum","traho","transire","trapezitam","trauma","tribus","triclinium",
	"triginta","trillion","tristis","triticum","tropicae","truculenter","truncus","tumultum","tunc","tunica","turba",
	"turcia","turpis","turrim","turtur","tutela","tutum","tuum","tympanum","ubi","ubicumque","uelut","ulcus","ultra",
	"umbra","una","unde","undique","uniformis","unio","universum","unum","unus","urbana","urbe","urbs","ursa","usquam",
	"usus","utendum","uterque","utilis","utrem","utrum","uxor","vaccinum","vadum","vale","valles","valorem","vanitati",
	"variis","vegetabilis","vehemens","vehiculum","vel","velit","velox","velum","venalicium","vendere","veneris","venire",
	"ventus","verbum","vere","verisimile","vero","verrat","versionem","vertere","verum","vesalius","vesperi","veteran",
	"vetus","vexationes","vexillum","via","viable","viatoribus","vicarius","vicinus","victima","vide","vigemusque",
	"vilis","villam","vinculum","vindicta","vinum","violentiam","vir","virgam","viridis","virtualiter","virum","vis",
	"visita","visneto","vita","vitium","vitrum","vivere","vivus","vix","vocatus","volare","voluptas","volvendo","vos",
	"vox","vtinam","vulgares","vultus","warantizare","zona"
];
	
let input_words = la_data.split('\r\n');

const updatePrefixes = ( words ) => {
	let prefixes = [];
	for (let i=0; i < words.length; i++) {
		let current_word = words[i];
		if (current_word == undefined || current_word == null) continue;
		
		console.log( "current_word: '" + current_word + "'");
		
		let prefix = "";
		
		if (current_word.length >= 4) {
			prefix = current_word.substring(0,4);	
		}
		else if (current_word.length == 3) {
			prefix = current_word.substring(0,3);	
		}		
		
		if ( prefix != "" && ! prefixes.includes(prefix) ) {
			// console.log( "new prefix: '" + prefix + "'");
			prefixes.push(prefix);
		}
	}  
	return prefixes;
}; // updatePrefixes() 

const getNewWordList = ( input_wordlist, previous_wordlist ) => {
	let new_wordlist    = [];
	let common_wordlist = [];
	
	for (let i=0; i < input_wordlist.length; i++) {
		let input_word = input_wordlist[i].toLowerCase();
		
		if ( ! previous_wordlist.includes(input_word) ) {

			if ( input_word.length >= 4 ) {
				new_wordlist.push(input_word);
			}
		} 
		else {
			// console.log( "input_word: " + input_word + " ALREADY in dictionary");
			common_wordlist.push(input_word);
		}
	}  
	return new_wordlist;
}; // getNewWordList()

const FuseWordlists = (previous_wordlist, new_wordlist, used_prefixes, expected_size) => {
	let fused_wordlists = previous_wordlist;
	// console.log("fused_wordlists: " + fused_wordlists.length);
	
	for (let i=0; i < new_wordlist.length; i++) {
		let new_word = new_wordlist[i].toLowerCase().replaceAll("\r","").replaceAll("\"","");
		// console.log("new_word: '" + new_word + "'"); 
		
		// console.log("word[" + i + "] : '" + new_word + "'");  
		if ( previous_wordlist.indexOf(new_word) == -1 ) {
			// console.log("1. word : '" + new_word + "' is not in 'previous_wordlist'");
			if ( new_word.length >= 3 ) {
				// console.log("2. word : '" + new_word + "' has length >= 4");
				let prefix = "";
				if ( new_word.length >= 4 ) {
					prefix = new_word.substring(0, 4);
				}	
				else if ( new_word.length == 3 ) {	
					prefix = new_word.substring(0, 3);
				}			

				if (prefix == "") continue;
				
				// console.log("3. word prefix of '" + new_word + "' is '" + prefix + "'");
				let prefix_index = used_prefixes.indexOf(prefix);
				if ( ! used_prefixes.includes(prefix) ) {
					// console.log("4. word prefix: '" + prefix + "' of '" + new_word + "' is not in 'used_prefixes'");
					fused_wordlists.push(new_word);
					PREFIXES.push(prefix);
					if (fused_wordlists.length == expected_size) {
						return fused_wordlists;
					}
				}
				else {
					// console.log("5. word prefix: '" + prefix + "' of '" + new_word + "' is ALREADY in 'used_prefixes' index: " + prefix_index);
				}
			}
		}
	}
    return fused_wordlists;	
}; // FuseWordlists()

// console.log("** Build russian 2048 wordlist **"); 

// console.log(JSON.stringify(json_data));
// Converts words to Uppercase
for (let i=0; i<input_words.length; i++) {
	let current_word = input_words[i];
	// console.log("word[" + i + "] = " + current_word);
	let current_word_UC = current_word.toUpperCase();
	// console.log(">> word[" + i + "] = " + current_word_UC);
	input_words[i] = current_word_UC;
}

// console.log( "RUSSIAN_MNEMONICS length: " + RUSSIAN_MNEMONICS.length); 
PREFIXES = updatePrefixes(LA_MNEMONICS);	
// console.log( "first_four_prefixes step 1: " + first_four_prefixes.length); 

let new_latin_wordlist = getNewWordList(input_words, LA_MNEMONICS);
// console.log( "first_four_prefixes step 2: " + first_four_prefixes.length);

let latin_wordlist = FuseWordlists(LA_MNEMONICS, new_latin_wordlist, PREFIXES, 2048);
// console.log( "russian_wordlist: " + russian_wordlist.length);
latin_wordlist.sort(); 

console.log(JSON.stringify(latin_wordlist));  
console.log(latin_wordlist.length); 

