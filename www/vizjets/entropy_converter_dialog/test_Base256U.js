// const BASE256U_ALPHABET = "ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğ !\"#$%&'()*+,-./0123456789:;<=>?@" +
//                           "ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~à"   +							  
//                           "âçèéêëîïôûùüÿœŒÀİıĲĳĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőĨĴŔŕŖŗŘřŚśŜŝŞşŠš"  +
//                           "ŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐƑƒƓƔƕƖƗƘƙƚƛƜƝƞƟƠ";
							 
const BASE256U_ALPHABET    =   "▲△▼▽▶▷◀◁♠♣♥♦€£¥¢§←↑→↓≪≫©®∀∃∈∞!\"#" +
                               "$%&()*+,-./0123456789:;<=>?@ABCD"   +
                               "EFGHIJKLMNOPQRSTUVWXYZ[\]^Þabcde"   + 
							   "fghijklmnopqrstuvwxyz{|}~àâçèéêë"   +							   
                               "îïôûùüÿœŒĀāĂăĆćĈĉĊċČčĎĐđĒēĔĕĖėĚě"   +							   
							   "ĞĿƔƕ∫∬∂αβγδεζηθλμξπςστφχψω∮∯∤≼≽≠"   +							   
                               "≶≸≡≤≥⊥⊤⊢⊣⊨⊩⊪⊗⊘⊙⊚⊞⊟⊕⊖⊜⊍◆◇◈◉○◎●◐◑∇"  +							   
							   "ΓΔΘΛΞΠΣΦΨΩ√∛∢∩⊂⊃⊄⊅∧∨∅⊓⊔⊏⊐⊑⊒┼∎◤◥◣◢";
							 
// Caractères latins accentués (début conservé)
//    "ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğ" +
    
 //   // Symboles mathématiques et grecs (remplacement)
//    "∀∁∂∃∄∅∆∇∈∉∊∋∌∍∎∏∐∑−∓∔∕∖∗∘∙√∛∜∝∞∟∠∡∢∣∤∥∦∧∨∩∪∫∬∭∮∯∰∱∲∳" +
    
 //   // Alphabet grec minuscules
 //   "αβγδεζηθικλμνξοπρςστυφχψω" +
    
 //   // Alphabet grec majuscules
 //   "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ" +
    
 //   // Symboles mathématiques supplémentaires
 //   "≈≠≡≤≥≪≫≲≳≴≵≶≷≸≹≺≻≼≽≾≿⊀⊁⊂⊃⊄⊅⊆⊇⊈⊉⊊⊋⊌⊍⊎⊏⊐⊑⊒⊓⊔⊕⊖⊗⊘⊙⊚⊛⊜⊝" +
							 
console.log("BASE256U_ALPHABET length:" + BASE256U_ALPHABET.length);

for (let i=0; i < BASE256U_ALPHABET.length; i++ ) {
	let current_char = BASE256U_ALPHABET[i];
	for (let j=i+1; j < BASE256U_ALPHABET.length; j++ ) {
		let current_J_char = BASE256U_ALPHABET[j];
		if ( current_J_char == current_char ) {
			console.log("current_char(" + i + "): " + current_char + " also at index " + j ); 
		}
		// else console.log("current_char(" + i + "): " + current_char + " <=> " + current_J_char ); 
	}
}	