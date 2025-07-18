//==================================================================================
//============================   EO_2048_mnemonics.js   ============================
//==================================================================================
// ---- Description ----
// Here is a Bip39 compatible (2048 words) wordlist for Esperanto language. 
// This wordlist was created from the Monero Esperanto wordlist (1626 words):
// - https://github.com/monero-project/monero/blob/master/src/mnemonics/esperanto.h
// This wordlist was then completed to 2048 words with the help of a 
// custom script (see 'EO_build_wordlist.js' in assets/mnemonics/Esperanto subfolder.
// 
// 1. The completion to 2048 words is under Cryptocalc copyright (BSD-3-Clause license):
//    - https://github.com/ALADAS-org/Cryptocalc/assets/mnemonics/EO_2048_mnemonics.js
// 
// 2. The source used by the custom script to find the missing 422 words is: 
//    a 15000 length wordlist published here (work under LICENSE-CC-BY-SA license)  
//    - https://github.com/Vanege/esperanto-frequency-list-tekstaro
// 
// 3. The "Completion script" is under Cryptocalc copyright (BSD-3-Clause license):
//    - https://github.com/ALADAS-org/Cryptocalc/assets/mnemonics/Esperanto/EO_build_wordlist.js
//
// ---- History ----
// Initial 1626 wordlist: Word list authored by: dnaleor, Engelberg, ProkhorZ
// Sources:
//   - Baza Radikaro Oficiala
//   - Reta Vortaro (http://www.reta-vortaro.de/revo/)
//   - Esperanto Panorama - Esperanto-English Dictionary (https://www.esperanto-panorama.net/vortaro/eoen.htm)
//   - ESPDIC - Paul Denisowski (http://www.denisowski.org/Esperanto/ESPDIC/espdic.txt)
//
// "Completion script" (BSD-3-Clause license):
//   - https://github.com/ALADAS-org/Cryptocalc/assets/mnemonics/Esperanto/EO_build_wordlist.js
//
// Source of 15000 Esperanto words (LICENSE-CC-BY-SA license): 
//   - https://github.com/Vanege/esperanto-frequency-list-tekstaro
//
// ---- Appendix ----
// * A.1. Monero project license:
// Copyright (c) 2014-2023, The Monero Project
// Source of the 1626 length wordlist:
// - https://github.com/monero-project/monero/blob/master/src/mnemonics/esperanto.h
//
// Copyright (c) 2014-2023, The Monero Project
// 
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice, this list of
//    conditions and the following disclaimer.
// 
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//    of conditions and the following disclaimer in the documentation and/or other
//    materials provided with the distribution.
// 
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//    used to endorse or promote products derived from this software without specific
//    prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict";

const ESPERANTO_MNEMONICS = [
  "abako","abdiki","abelo","abituriento","ablativo","abnorma","abonantoj","abrikoto","absoluta","abunda",
  "acetono","acida","adapti","adekvata","adheri","adicii","adjektivo","administri","adolesko","adreso",
  "adstringa","adulto","advokato","adzo","aeroplano","aferulo","afgana","afiksi","aflaba","aforismo",
  "afranki","afrika","aftozo","afusto","agado","agavo","agento","agiti","aglo","agmaniero","agnoski",
  "agordo","agrabla","agtipo","agutio","aikido","ailanto","aina","ajatolo","ajgenvaloro","ajlobulbo",
  "ajnlitera","ajuto","ajzi","akademio","akcepti","akeo","akiri","aklamado","akmeo","akno","akompani",
  "akrobato","akselo","aktiva","akurata","akvofalo","alarmo","albumo","alcedo","aldoni","aleo","alfabeto",
  "algo","alhasti","alia","alie","aliflanke","aligatoro","alkoholo","almenau","almozo","alnomo","alojo",
  "alpinisto","alporti","alrigardi","alskribi","alta","alte","alumeto","alveni","alvoki","alzaca","amaso",
  "ambasado","amdeklaro","amebo","amfibio","amhara","amiko","amkanto","amletero","amnestio","amoranto",
  "amplekso","amrakonto","amsterdama","amuzi","ananaso","androido","anekdoto","anfrakto","angla","angulo",
  "anheli","animo","anjono","ankau","ankorau","ankro","anonci","anpriskribo","ansero","anstatau","antau",
  "antikva","anuitato","aorto","aparta","apenau","aperti","apika","aplikado","apneo","apogi","aprobi","apsido",
  "apterigo","apudesto","araba","araneo","arbaro","arbo","ardeco","aresti","argilo","argumento","aristokrato",
  "arko","arlekeno","armeo","armi","arniko","aromo","arpio","arsenalo","artisto","arto","aruba","arvorto",
  "asaio","asbesto","ascendi","asekuri","asembleo","aserti","asfalto","asisti","askalono","asocio","aspekti",
  "astro","asulo","atakonto","atendi","atingi","atleto","atmosfero","atomo","atropino","atuto","audi","augusto",
  "auskulti","autoro","avataro","aventuro","aviadilo","avokado","azaleo","azbuko","azenino","azilpetanto","azoto",
  "azteka","babili","bacilo","badmintono","bagatelo","bahama","bajoneto","baki","balai","baldau","bambuo","bani",
  "banko","baobabo","bapti","baro","bastono","batalo","batilo","bavara","bazalto","bazo","beata","bebofono",
  "bedaurinde","bedo","begonio","behaviorismo","bejlo","bekero","belarto","belega","bemolo","benko","bereto",
  "besto","betulo","bevelo","bezoni","biaso","biblioteko","biciklo","bidaro","bieno","bifsteko","bigamiulo",
  "bijekcio","bikino","bildo","bimetalismo","bindi","biografio","birdo","biskvito","bitlibro","bivako","bizara",
  "bjalistoka","blanka","bleki","blinda","blovi","blua","boato","bobsledo","bocvanano","bodisatvo","bofratino",
  "bogefratoj","bohema","boji","bokalo","boli","bombono","bona","bone","bopatrino","bordo","bosko","botelo",
  "bovido","brakpleno","branco","bretaro","brikmuro","brita","broso","brulema","brusto","bubalo","buctrapi",
  "budo","bufedo","bugio","bujabeso","buklo","buldozo","bumerango","bunta","burokrataro","busbileto","buso",
  "butero","buzuko","cambro","capitro","caro","cebo","ceceo","cedro","ceesti","cefalo","cefe","cefministro",
  "cefo","cefurbo","cejana","cekumo","celebri","celi","celo","cemento","cent","cepo","certa","cesi","cetera",
  "cevalo","cezio","ciam","ciano","cibeto","cico","cidro","cielo","cifero","cigaredo","ciklo","cilindro",
  "cimbalo","cinamo","cipreso","cirkonstanco","cisterno","citrono","ciujare","ciumi","ciutage","civilizado",
  "colo","congo","cunamo","cvana","dabi","daco","dadaismo","dafodilo","dago","daimio","dajmono","daktilo",
  "dalio","damo","dangero","danki","darmo","datumoj","daurigi","dazipo","deadmoni","debato","debeto","decidi",
  "dedukti","deerigi","defendi","degeli","dehaki","deirpunkto","deklaracio","delikata","demandi","demokratio",
  "denove","dento","dependi","derivi","desegni","detalo","detrui","devi","devo","deziri","dialogo","dicentro",
  "didaktika","dieto","diferenci","digesti","diino","dikfingro","diligenta","dimensio","dinamo","diodo",
  "diplomo","dirante","direkte","diri","diskuti","disponi","diurno","diversa","dizajno","dobrogitaro","docento",
  "dogano","dojeno","doktoro","dokumento","dolaro","dolori","domego","domo","donaci","doni","dopado","dormi",
  "dosierujo","dotita","dozeno","drato","dresi","drinki","droni","druido","duaranga","dubi","ducent","dudek",
  "duelo","dufoje","dugongo","duhufa","duilo","dujare","dukato","duloka","dume","dumtempe","dungi","duobla",
  "duono","dupiedulo","dura","dusenca","dutaga","duuma","duvalvuloj","duzo","ebena","ebla","eblecoj","ebli",
  "eblo","ebono","ebria","eburo","ecaro","ecigi","ecoj","edelvejso","editoro","edro","eduki","edzino","edzo",
  "efektiva","efiki","efloreski","egala","egeco","egiptologo","eglefino","egoista","egreto","ejakuli","ejlo",
  "ekarto","ekbruligi","ekceli","ekde","ekesti","ekfirmao","ekgliti","ekhavi","ekipi","ekkapti","ekkrii",
  "eklezio","ekmalsati","ekonomio","ekpluvi","ekrano","eksa","ekscii","ekster","ektiri","ekumeno","ekvilibro",
  "ekzemplo","ekzisti","elasta","elbalai","elcento","eldoni","elektro","elemento","elfari","elgliti","elhaki",
  "elipso","eliri","elkovi","ellasi","elmeti","elnutri","elokventa","elparoli","elrevigi","elstari","elteni",
  "eluzita","elvoki","elzasa","emajlo","embaraso","emerito","emfazo","eminenta","emocio","empiria","emulsio",
  "enarkivigi","enboteligi","enciklopedio","endorfino","energio","enfermi","engluti","enhavo","enigmo","eniri",
  "enjekcio","enketi","enlanda","enmeti","enorma","enplanti","enradiki","enspezo","entrepreni","entute","enui",
  "envolvi","enzimo","eono","eosto","epitafo","epoko","epriskribebla","epsilono","erari","erbio","erco","erekti",
  "ergonomia","erikejo","ermito","erotika","erpilo","erupcio","esameno","escepti","esenco","eskapi","esotera",
  "esperi","esploro","esprimi","esti","estonto","estraro","etapo","etendi","etfingro","etikedo","etlitero",
  "etmakleristo","etnika","etoso","etradio","etskala","etullernejo","euro","evakui","evento","evidente","eviti",
  "evolui","ezoko","fabriko","facila","fadeno","fagoto","fajro","faka","fako","fakto","fakulo","fali","fama",
  "familio","fanatiko","faraono","farbo","fare","fari","fasko","fatala","favora","fazeolo","febro","federacio",
  "feino","fekunda","felica","felo","femuro","fenestro","fenomeno","fermi","festi","fetora","fezo","fiasko",
  "fibro","fidela","fiera","fifama","figuro","fiherbo","fiinsekto","fiksa","filino","filmo","filo","fimensa",
  "finalo","fine","finfine","finigi","fino","fiolo","fiparoli","firmao","fisko","fitingo","fiuzanto","fivorto",
  "fiziko","fjordo","flago","flanko","flegi","flirti","floro","flugi","fobio","foceno","foirejo","foje","fojfoje",
  "fojo","fokuso","folio","fomenti","fonto","forgesi","foriri","forkuri","forlasi","formulo","forto","forumo",
  "fosforo","fotografi","franca","fratino","fraulino","frazo","fremda","friti","fronte","frosto","frua","frue",
  "ftizo","fuelo","fugo","fuksia","fulmilo","fumanto","fundamento","funkcii","fuorto","furioza","fusilo","futbalo",
  "fuzio","gabardino","gado","gaela","gafo","gagato","gaja","gajni","gaki","galanta","gamao","ganto","gapulo",
  "gardi","gasto","gavio","gazeto","geamantoj","gebani","geedzeco","gefratoj","geheno","gejsero","geko","gelateno",
  "gemisto","generala","geniulo","geografio","gepardo","geranio","gestolingvo","geto","geumo","gibono","giganta",
  "gildo","gimnastiko","ginekologo","gipsi","girlando","gistfungo","gitaro","glazuro","glebo","gliti","globo",
  "gluti","gnafalio","gnejso","gnomo","gnuo","gobio","godetio","goeleto","goji","gojo","golfludejo","gombo",
  "gondolo","gorilo","gospelo","gotika","granda","grava","greka","greno","griza","groto","grupo","guano",
  "gubernatoro","gudrotuko","gufo","gujavo","guldeno","gumi","gupio","guruo","gusto","guto","guvernistino",
  "gvardio","gverilo","gvidanto","habitato","hadito","hafnio","hagiografio","haitiano","hajlo","hakbloko",
  "halti","hamstro","hangaro","hapalo","haro","hasta","hati","havebla","havi","hazardo","hebrea","hedero",
  "hegemonio","hejmo","hektaro","helpi","hemisfero","heni","hepato","herbo","hesa","heterogena","heziti",
  "hiacinto","hibrida","hidrogeno","hieroglifo","higieno","hihii","hilumo","himno","hindino","hiperteksto",
  "hirundo","hispana","historio","hobio","hodiau","hojli","hokeo","hologramo","homa","homido","homo","honesta",
  "hopi","horizonto","horo","hospitalo","hotelo","huadi","hubo","hufumo","hugenoto","hukero","huligano",
  "humana","hundo","huoj","hupilo","hurai","husaro","hutuo","huzo","iafoje","iagrade","iamaniere","iarelate",
  "iaspeca","ibekso","ibiso","idaro","ideala","ideo","idiomo","idolo","iele","igluo","ignori","iguamo","igvano",
  "ikono","iksodo","ikto","iliaflanke","ilkomputilo","ilobreto","ilremedo","ilumini","imagi","imitado","imperio",
  "imposto","impreso","imuna","incidento","indiki","industrio","inerta","infano","influo","informo","ingenra",
  "inhali","iniciati","injekti","inklino","inokuli","insekto","institucio","insulo","inteligenta","inundi",
  "inviti","ioma","iomete","ionosfero","iperito","ipomeo","irana","irejo","irigacio","ironio","isato","islamo",
  "israela","istempo","itala","itinero","itrio","iuloke","iumaniere","iutempe","izolita","jado","jaguaro",
  "jakto","jama","januaro","japano","jarcento","jardeko","jaro","jarringo","jazo","jenoj","jesulo","jetavio",
  "jeti","jezuito","jodli","joviala","juano","jubileo","judismo","jufto","juki","julio","juna","juneca","junulo",
  "jupo","jura","juristo","jurnalisto","juste","juvelo","kabineto","kadrato","kafo","kahelo","kajako","kakao",
  "kalkuli","kampo","kandidato","kanti","kapabli","kapitalo","kapo","kapti","karaktero","kaserolo","kasi","katapulto",
  "kauzi","kaverna","kazino","kazo","kebabo","kefiro","keglo","kejlo","kekso","kelka","kemio","kerno","kesto",
  "kial","kiamaniere","kibuco","kidnapi","kielo","kies","kikero","kilogramo","kimono","kinejo","kiom","kiosko",
  "kirurgo","kisi","kitelo","kivio","klarigi","klaso","klavaro","klerulo","klini","klopodi","klubo","knabo","knedi",
  "koalo","kobalto","kodigi","kofro","kohera","koincidi","kojoto","kokoso","kolekti","koloro","komenci","komisiono",
  "kompreni","komuna","konata","koncepto","konduki","konflikto","kongreso","koni","konkurso","konsideri","kontrakto",
  "kopio","korekte","koro","korpo","kosti","kotono","kovri","krajono","kredi","krei","kreski","krii","krimo",
  "krizo","krom","kruco","ksantino","ksenono","ksilofono","ksosa","kubo","kubuto","kudri","kuglo","kuiri","kuko",
  "kulero","kulturo","kumuluso","kuneco","kunlaboro","kunveno","kupro","kuracisto","kuri","kurso","kuseno","kusi",
  "kutimo","kuvo","kuzino","kvalito","kvankam","kvar","kvazau","kverko","kvin","kvoto","labori","laculo","ladbotelo",
  "lafo","laguno","laikino","laktobovino","lampolumo","lanci","landkarto","laosa","lapono","larmoguto","lasi",
  "lastjare","latitudo","lavejo","lazanjo","leciono","ledosako","leganto","legi","lego","lekcio","lemura","lentuga",
  "leopardo","leporo","lerni","lesivo","letero","levilo","lezi","liano","libera","libro","liceo","lieno","lifto",
  "ligilo","ligo","likvoro","lila","limono","lingvo","lipo","lirika","listo","literatura","lito","liveri","lobio",
  "logantaro","logejo","logika","lojala","lokalo","loko","longa","lordo","lotado","loza","luanto","lubriki","lucida",
  "ludema","ludi","ludo","luigi","lukso","luli","lumbilda","lumo","lunde","lupago","lustro","lutilo","luzerno",
  "maato","maceri","madono","mafiano","magazeno","mahometano","maizo","majstro","maketo","malaperi","malbona",
  "maldekstra","male","malfermi","malgranda","malhelpi","maljuna","malkovri","mallonga","malmulte","malnova","malpli",
  "malrica","malsano","malvarma","mamo","mandareno","mangi","maniero","manki","mano","maorio","mapigi","marini",
  "maro","masko","mastro","mateno","mazuto","meandro","meblo","mecenato","medialo","mefito","megafono","mejlo",
  "mekanika","melodia","membro","memori","mencii","mendi","mergi","merkato","mespilo","meti","metoda","mevo","meza",
  "meze","mezuri","miaflanke","micelio","mielo","migdalo","mikrofilmo","militi","milo","mimiko","minaco","mineralo",
  "ministro","minuto","miopa","miri","mistera","mitralo","mizeri","mjelo","mnemoniko","mobilizi","mocio","moderna",
  "mohajro","mokadi","molaro","momento","monato","mondo","monero","mono","montri","mopso","mordi","morti","moskito",
  "motoro","movado","movimento","mozaiko","mueli","mukozo","muldi","multa","mumio","munti","muro","muskolo","mutacio",
  "muzikisto","n-ro","nabo","nacio","nadlo","nafto","naiva","najbaro","nanometro","napo","narciso","naski","naturo",
  "navigi","naztruo","neatendite","nebulo","necesa","nedankinde","neebla","nefari","negoco","nehavi","neimagebla",
  "nektaro","nelonga","nematura","nenia","neordinara","nepra","nervuro","nesto","nete","neulo","nevino","nifo",
  "nigra","nihilisto","nikotino","nilono","nimfeo","nitrogeno","nivelo","nobla","nocio","nodozo","nokto","nombro",
  "nome","nomi","nomkarto","nomo","norda","nostalgio","notbloko","nova","novico","nuanco","nuboza","nuda","nugato",
  "nuklea","nuligi","numero","nuna","nuntempe","nupto","nura","nutri","oazo","obei","objekto","oblikva","obolo",
  "observi","obtuza","obuso","oceano","odekolono","odori","oferti","oficiala","ofsajdo","ofte","ogivo","ogro",
  "ojstredoj","okaze","okcidenta","okro","oksido","oktobro","okulo","okupi","oldulo","oleo","olivo","omaro","ombro",
  "omego","omikrono","omleto","omnibuso","onagro","ondo","oneco","onidire","onklino","onlajna","onomatopeo","ontologio",
  "opaka","operacii","opinii","oportuna","opresi","optimisto","oratoro","orbito","ordinara","ordoni","orelo","orfino",
  "organizi","orienta","originala","orkestro","orlo","orminejo","ornami","ortangulo","orumi","oscedi","osmozo",
  "ostocerbo","ovalo","ovingo","ovoblanko","ovri","ovulado","ozono","pacama","paco","padeli","pafilo","pagigi","pago",
  "pajlo","paketo","palaco","pampelmo","pano","pantalono","papero","pardoni","parlamento","paroli","parto","pasejo",
  "pasi","paso","pastro","patro","pavimo","peco","pedalo","peklita","pelikano","pensiono","peplomo","perdi","pere",
  "perforto","periodo","permesi","persono","pesilo","petanto","peti","peza","pezoforto","piano","picejo","piede",
  "pigmento","pikema","pilkoludo","pimento","pinglo","pioniro","pipromento","pirato","pistolo","pitoreska","piulo",
  "pivoti","pizango","placi","planko","plej","plektita","plena","plezuro","plia","plibonigi","plimulto","ploradi",
  "plue","plurlingva","pobo","podio","poemo","poeto","pogranda","pohora","pokalo","pola","politekniko","pomarbo",
  "ponevosto","popolo","populara","porcelana","pordo","porti","posedi","postkompreno","poteto","poviga","povo",
  "pozitiva","prapatroj","precize","preferi","pregejo","prelego","premio","preni","prepari","preskau","preta",
  "prezidanto","pridemandi","principo","pripensi","privata","probable","produkto","profunda","programo","projekto",
  "proksima","promesi","propra","protekti","provi","pruntanto","pruvi","psalmo","psikologio","psoriazo","pterido",
  "publiko","pudro","pufo","pugnobato","pulovero","pumpi","punkto","pupo","pura","pureo","puso","putrema","puzlo",
  "rabate","racionala","radiko","rafinado","raguo","rajto","rakonti","ralio","rampi","rando","rapida","raporto",
  "rastruma","ratifiki","raviolo","razeno","reakcio","reala","rebildo","recepto","redakti","reenigi","reformi",
  "regado","regiono","regno","rego","regulo","rehavi","reinspekti","rejesi","reklamo","rekoni","rekte","relativa",
  "religia","rememori","renkonti","reorganizado","reprezenti","respondi","resti","retejo","reto","retumilo",
  "reuzebla","reveni","revidi","revolucio","revuo","rezulti","rialo","ribeli","rica","ricevi","ridiga","rifuginto",
  "rigardi","rikolti","rilati","rimarki","rimedo","rinocero","ripeti","ripozi","riski","ritmo","rivero","rizokampo",
  "roboto","rododendro","rojo","rokmuziko","rolo","rolvorto","romantika","rompi","ronroni","rosino","rotondo",
  "rovero","rozeto","rubando","rudimenta","rufa","ruga","rugbeo","ruino","ruleto","rumoro","runo","rupio","rura",
  "rusa","rustimuna","ruzulo","sabato","sadismo","safario","sagaca","sajni","sakfluto","salajro","salti","sama",
  "same","samtage","sanco","sandalo","sangi","sankta","sano","sapejo","sarongo","satelito","sati","savano","savi",
  "sbiro","sciado","scienco","scii","scio","seanco","sebo","sedativo","segligno","sego","sekretario","sektoro",
  "sekureco","sekvi","selektiva","semajno","senco","sendi","senpeza","senti","separeo","serci","serioza","servilo",
  "sesangulo","setli","seurigi","severa","sezono","sfagno","sfero","sfinkso","siatempe","siavice","siblado","sidejo",
  "sidi","siesto","sifono","signalo","siklo","silenti","simila","simpla","sinjoro","sinteno","sipo","siropo","sistemo",
  "situacio","siverto","sizifa","skatolo","skemo","skianto","sklavo","skorpio","skribisto","skulpti","skvamo","slango",
  "sledeto","sliparo","smeraldo","smirgi","smokingo","smuto","snoba","snufegi","sobra","sociano","sodakvo","sofo",
  "soifi","sojlo","soklo","sola","soldato","sole","solvo","somero","sonilo","sono","sopiri","sorto","soulo","soveto",
  "spaco","sparkado","speciala","sperto","spiri","splito","sporto","sprita","spuro","stabila","stari","stato",
  "stelfiguro","stimulo","stomako","stono","strato","strukturo","studanto","subgrupo","subite","subteni","suda",
  "suden","suferanta","sufice","sugesti","suito","sukcesi","sukero","suldo","sulko","sume","sumo","sunlumo","suno",
  "super","supozi","supre","surskribeto","suspekti","suturo","svati","svenfali","svingi","svopo","tabako","tablo",
  "taglumo","tago","tajloro","taksimetro","talento","tamen","tanko","taoismo","tapioko","tarifo","tasko","tatui",
  "tauga","taverno","teatro","tedlaboro","tegmento","tehoro","teknika","teksto","telefono","temi","temo","tempo",
  "tenisejo","teorie","teraso","teritorio","tero","terura","testudo","tetablo","teujo","tezo","tialo","tiam","tibio",
  "tielnomata","ties","tifono","tigro","tikli","timida","timo","tinkturo","tiom","tiparo","tirkesto","titolo",
  "tiutempe","tizano","tobogano","tofeo","togo","toksa","tolerema","tombolo","tondri","topografio","tordeti","tosti",
  "totalo","traduko","trafi","traktato","transdoni","tredi","triangulo","tridek","trinki","tropika","trovi","trudi",
  "trumpeto","tualeto","tubisto","tufgrebo","tuja","tukano","tulipo","tumulto","tunelo","turisto","turni","tusi",
  "tuta","tute","tutmonda","tvisto","udono","uesto","ukazo","ukelelo","ulcero","ulmo","ultimato","ululi","umbiliko",
  "unco","ungego","uniformo","unio","universitato","unkti","unua","unue","unuiginta","unukolora","uragano","urbano",
  "urbo","uretro","urino","ursido","uskleco","usonigi","utero","utila","utopia","uverturo","uzadi","uzeblo","uzino",
  "uzkutimo","uzofini","uzurpi","uzvaloro","vadejo","vafleto","vagono","vahabismo","vajco","vakcino","valoro",
  "vampiro","vangharoj","vaporo","varma","vasta","vato","vazaro","veaspekta","vedismo","vegetalo","vehiklo","vejno",
  "vekita","velstango","vemieno","vendi","veni","venki","venonta","vento","vepro","verando","verda","vere","verko",
  "vero","versajne","vespero","vesto","veturi","veziko","viando","vibri","vico","videbla","vidi","vidpunkto","vifio",
  "vigla","viktimo","vila","vimeno","vino","vintro","violo","vippuno","virino","viro","virtuala","viskoza","vitro",
  "viveca","vivi","vivo","vizago","viziti","vobli","voco","vodko","vojago","vojeto","vojo","vokegi","voki","volbo",
  "voli","volo","vomema","vono","vortaro","vosto","voti","vrako","vringi","vualo","vulkano","vundo","vuvuzelo",
  "zamenhofa","zapi","zebro","zefiro","zeloto","zenismo","zeolito","zepelino","zeto","zigzagi","zinko","zipo",
  "zirkonio","zodiako","zoeto","zombio","zono","zoologio","zorgi","zukino","zumilo" 
];

//console.log("ESPERANTO: " + ESPERANTO_MNEMONICS.length);

if (typeof exports === 'object') {
	exports.ESPERANTO_MNEMONICS = ESPERANTO_MNEMONICS	
} // exports of 'EO_mnemonics.js'
