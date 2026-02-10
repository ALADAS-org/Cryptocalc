import os
from pathlib import Path

def generate_github_urls():
    """
    Génère un fichier files.txt avec les URLs GitHub raw pour tous les fichiers
    .js, .css, .txt, .html, .md en excluant certains dossiers LOCAUX
    """
    
    # Configuration
    REPO_URL = "https://raw.githubusercontent.com/aladas-org/cryptocalc/master/"
    OUTPUT_FILE = "files.txt"
    
    # Extensions à inclure
    INCLUDED_EXTENSIONS = {'.js', '.css', '.txt', '.html', '.md'}
    
    # Dossiers LOCAUX à exclure (dans le système de fichiers)
    EXCLUDED_LOCAL_DIRS = {
        'node_modules',
        '.git',
        '_doc',
        '_inno_setup',
        '_output',
        '_protos'
    }
    
    print("=" * 60)
    print("Génération de files.txt avec URLs raw GitHub")
    print("=" * 60)
    print()
    print(f"Extensions incluses: {', '.join(sorted(INCLUDED_EXTENSIONS))}")
    print(f"Dossiers locaux exclus: {', '.join(sorted(EXCLUDED_LOCAL_DIRS))}")
    print()
    print("Note: Les URLs contenant ces mots (ex: .../node_modules/...)")
    print("      sont AUTORISÉES si elles viennent de GitHub")
    print()
    
    # Répertoire courant
    current_dir = Path.cwd()
    print(f"Analyse du répertoire: {current_dir}")
    
    # Liste pour stocker les URLs générées
    urls_generated = []
    
    # Parcourir le système de fichiers local
    for root, dirs, files in os.walk(current_dir):
        root_path = Path(root)
        
        # Vérifier si ce chemin local doit être exclu
        skip_folder = False
        for excluded_dir in EXCLUDED_LOCAL_DIRS:
            # Vérifier si le dossier exclu fait partie du chemin local
            if excluded_dir in root_path.parts:
                skip_folder = True
                break
        
        # Si c'est un dossier local exclu, on saute
        if skip_folder:
            # Ne pas parcourir les sous-dossiers
            dirs.clear()
            continue
        
        # Traiter les fichiers de ce dossier
        for file_name in files:
            file_path = root_path / file_name
            
            # Vérifier l'extension
            if file_path.suffix.lower() not in INCLUDED_EXTENSIONS:
                continue
            
            # Obtenir le chemin relatif
            try:
                relative_path = file_path.relative_to(current_dir)
            except ValueError:
                continue
            
            # Convertir pour URL
            url_path = str(relative_path).replace('\\', '/')
            
            # Encoder les espaces
            url_path = url_path.replace(' ', '%20')
            
            # Construire l'URL complète
            full_url = f"{REPO_URL}{url_path}"
            urls_generated.append(full_url)
    
    # Écrire toutes les URLs dans le fichier
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
        for url in sorted(urls_generated):  # Tri alphabétique
            f_out.write(url + '\n')
    
    # Résultats
    file_count = len(urls_generated)
    print(f"\n✅ Terminé !")
    print(f"URLs générées: {file_count}")
    print(f"Fichier créé: {OUTPUT_FILE}")
    
    # ANALYSE des URLs générées
    print("\n" + "=" * 60)
    print("ANALYSE des URLs générées")
    print("=" * 60)
    
    # 1. Vérifier qu'aucune URL ne pointe vers un dossier local exclu
    print("\n🔍 Vérification des exclusions LOCALES:")
    local_exclusion_issues = 0
    
    for url in urls_generated:
        # Extraire le chemin après "master/"
        if "master/" in url:
            path_part = url.split("master/")[1]
            
            # Vérifier si ce chemin correspond à un dossier local exclu
            # On vérifie seulement au début du chemin (premier segment)
            parts = path_part.split('/')
            if parts and parts[0] in EXCLUDED_LOCAL_DIRS:
                print(f"❌ ERREUR: URL pointe vers un dossier local exclu: {url}")
                local_exclusion_issues += 1
    
    if local_exclusion_issues == 0:
        print("✅ OK: Aucune URL ne pointe vers un dossier local exclu")
    else:
        print(f"⚠️  {local_exclusion_issues} problème(s) trouvé(s)")
    
    # 2. Compter les URLs par type
    print("\n📊 Répartition par extension:")
    ext_counts = {}
    for url in urls_generated:
        for ext in INCLUDED_EXTENSIONS:
            if url.endswith(ext):
                ext_counts[ext] = ext_counts.get(ext, 0) + 1
                break
    
    for ext in sorted(INCLUDED_EXTENSIONS):
        count = ext_counts.get(ext, 0)
        print(f"  {ext}: {count}")
    
    # 3. URLs intéressantes (contenant certains mots)
    print("\n🔍 URLs contenant des mots-clés spécifiques:")
    
    keywords_to_check = ['github', 'modules', 'git', 'output', 'release']
    for keyword in keywords_to_check:
        matching = [url for url in urls_generated if keyword in url.lower()]
        if matching:
            print(f"  '{keyword}': {len(matching)} URL(s)")
            for url in matching[:2]:  # Afficher 2 exemples max
                print(f"    - {url}")
            if len(matching) > 2:
                print(f"    ... et {len(matching)-2} autres")
        else:
            print(f"  '{keyword}': 0 URL")
    
    # 4. Afficher un échantillon
    print("\n📄 Échantillon des URLs (10 premières):")
    print("-" * 60)
    for i, url in enumerate(urls_generated[:10], 1):
        print(f"{i:2}. {url}")
    
    if len(urls_generated) > 10:
        print(f"... et {len(urls_generated) - 10} autres")
    
    print("\n" + "=" * 60)
    
    # Vérification manuelle optionnelle
    print("\n🔎 Vérification manuelle recommandée:")
    print(f"1. Ouvrez {OUTPUT_FILE}")
    print(f"2. Cherchez 'node_modules' (Ctrl+F)")
    print(f"3. Cherchez '.git'")
    print(f"4. Vérifiez que seules les URLs GitHub sont présentes")
    
    # Message final
    print("\n✅ Script terminé avec succès !")

def main():
    """Fonction principale"""
    print("🚀 Générateur d'URLs GitHub Raw - Version CORRIGÉE")
    print("=" * 50)
    print()
    print("ATTENTION: Ce script exclut les dossiers LOCAUX (.git, node_modules, etc.)")
    print("mais les URLs GitHub contenant ces mots sont AUTORISÉES.")
    print()
    print("Exemple autorisé: https://raw.githubusercontent.com/.../node_modules/...")
    print()
    
    # Demander confirmation
    current_dir = Path.cwd()
    print(f"Répertoire courant: {current_dir}")
    print()
    
    response = input("Voulez-vous générer le fichier files.txt? (o/n): ")
    
    if response.lower() == 'o':
        generate_github_urls()
    else:
        print("❌ Annulation.")
        return
    
    # Garder la fenêtre ouverte
    input("\nAppuyez sur Entrée pour quitter...")

if __name__ == "__main__":
    main()