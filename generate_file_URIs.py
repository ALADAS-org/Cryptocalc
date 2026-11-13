"""
Génère files.txt : les URLs GitHub raw des fichiers .js, .css, .txt, .html, .md du dépôt.

La liste vient de git (fichiers suivis + nouveaux fichiers pas encore ajoutés), et non
du disque : les fichiers ignorés par .gitignore (rapports de couverture, rapport
Playwright, log.txt...) n'existent pas sur GitHub et ne doivent jamais être listés.

Usage :
    python generate_file_URIs.py                      (double-clic : demande confirmation)
    python generate_file_URIs.py --yes                (sans question, pour l'automatisation)
    python generate_file_URIs.py --yes --output x.txt (écrit ailleurs qu'à la racine du dépôt)

Le script peut être lancé depuis n'importe quel sous-dossier du dépôt.
"""
import argparse
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote

# Configuration
REPO_URL = "https://raw.githubusercontent.com/aladas-org/cryptocalc/master/"
OUTPUT_FILE = "files.txt"

# Extensions à inclure
INCLUDED_EXTENSIONS = {'.js', '.css', '.txt', '.html', '.md'}

# Dossiers exclus (n'importe quel segment du chemin)
EXCLUDED_LOCAL_DIRS = {
    'node_modules',
    '.git',
    '_doc',
    '_inno_setup',
    '_output',
    '_protos'
}


class GitError(Exception):
    """git introuvable, ou dossier hors d'un dépôt git"""


def run_git(args, cwd):
    """Lance une commande git et renvoie sa sortie (texte UTF-8)"""
    try:
        result = subprocess.run(["git", *args], cwd=cwd, capture_output=True, check=False)
    except FileNotFoundError:
        raise GitError("git est introuvable : installez git ou ajoutez-le au PATH.")
    if result.returncode != 0:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise GitError(f"'git {' '.join(args)}' a échoué : {message}")
    return result.stdout.decode("utf-8")


def get_repo_root(start_dir):
    """Racine du dépôt git, quel que soit le dossier d'où le script est lancé"""
    return Path(run_git(["rev-parse", "--show-toplevel"], start_dir).strip())


def list_repo_files(repo_root):
    """
    Fichiers suivis + nouveaux fichiers pas encore ajoutés, SANS les fichiers ignorés.
    -z : chemins bruts (sans les guillemets que git ajoute aux accents et aux espaces)
    """
    output = run_git(["ls-files", "-z", "--cached", "--others", "--exclude-standard"], repo_root)
    paths = sorted({path for path in output.split("\0") if path})
    # Un fichier suivi mais supprimé du disque (suppression pas encore commitée) est écarté
    return [path for path in paths if (repo_root / path).is_file()]


def is_listed(path):
    """Extension incluse et aucun segment du chemin dans un dossier exclu"""
    parts = path.split("/")
    if any(part in EXCLUDED_LOCAL_DIRS for part in parts[:-1]):
        return False
    return Path(parts[-1]).suffix.lower() in INCLUDED_EXTENSIONS


def path_to_url(path):
    """Chemin relatif ('/' comme séparateur) => URL raw (espaces, accents, % encodés)"""
    return REPO_URL + quote(path, safe="/")


def generate_urls(repo_root):
    """URLs triées des fichiers du dépôt à lister"""
    return sorted(path_to_url(path) for path in list_repo_files(repo_root) if is_listed(path))


def print_analysis(urls):
    """Analyse affichée à la fin (répartition par extension, échantillon)"""
    print("\n" + "=" * 60)
    print("ANALYSE des URLs générées")
    print("=" * 60)

    print("\n📊 Répartition par extension:")
    ext_counts = {}
    for url in urls:
        ext = Path(url).suffix.lower()
        ext_counts[ext] = ext_counts.get(ext, 0) + 1
    for ext in sorted(INCLUDED_EXTENSIONS):
        print(f"  {ext}: {ext_counts.get(ext, 0)}")

    print("\n📄 Échantillon des URLs (10 premières):")
    print("-" * 60)
    for i, url in enumerate(urls[:10], 1):
        print(f"{i:2}. {url}")
    if len(urls) > 10:
        print(f"... et {len(urls) - 10} autres")
    print("\n" + "=" * 60)


def generate_github_urls(output_path=None, start_dir=None):
    """Écrit files.txt et renvoie la liste des URLs"""
    repo_root = get_repo_root(start_dir or Path.cwd())
    output_path = Path(output_path) if output_path else repo_root / OUTPUT_FILE

    print("=" * 60)
    print("Génération de files.txt avec URLs raw GitHub")
    print("=" * 60)
    print()
    print(f"Dépôt git: {repo_root}")
    print(f"Extensions incluses: {', '.join(sorted(INCLUDED_EXTENSIONS))}")
    print(f"Dossiers exclus: {', '.join(sorted(EXCLUDED_LOCAL_DIRS))}")
    print("Fichiers ignorés par .gitignore: exclus (liste fournie par git)")

    urls = generate_urls(repo_root)

    # newline='\n' : même fichier sous Windows et Linux
    with open(output_path, "w", encoding="utf-8", newline="\n") as f_out:
        for url in urls:
            f_out.write(url + "\n")

    print(f"\n✅ Terminé !")
    print(f"URLs générées: {len(urls)}")
    print(f"Fichier créé: {output_path}")
    print_analysis(urls)
    return urls


def use_utf8_output():
    """Sortie redirigée sous Windows (cp1252) : UTF-8, sinon les emojis font planter le script"""
    for stream in (sys.stdout, sys.stderr):
        encoding = (getattr(stream, "encoding", "") or "").lower().replace("-", "")
        if encoding != "utf8" and hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")


def main(argv=None):
    """Fonction principale"""
    use_utf8_output()
    parser = argparse.ArgumentParser(description="Génère files.txt (URLs GitHub raw des fichiers du dépôt)")
    parser.add_argument("--yes", action="store_true", help="ne pas demander de confirmation")
    parser.add_argument("--output", help=f"fichier de sortie (défaut : {OUTPUT_FILE} à la racine du dépôt)")
    args = parser.parse_args(argv)

    print("🚀 Générateur d'URLs GitHub Raw")
    print("=" * 50)
    print()
    print(f"Répertoire courant: {Path.cwd()}")
    print()

    if not args.yes:
        response = input("Voulez-vous générer le fichier files.txt? (o/n): ")
        if response.lower() != 'o':
            print("❌ Annulation.")
            return 0

    try:
        generate_github_urls(args.output)
        exit_code = 0
    except GitError as err:
        print(f"\n❌ ERREUR: {err}")
        print("   Ce script doit être lancé dans le dépôt git de Cryptocalc.")
        exit_code = 1

    # Garder la fenêtre ouverte (double-clic)
    if not args.yes:
        input("\nAppuyez sur Entrée pour quitter...")
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
