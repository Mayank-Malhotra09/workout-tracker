import subprocess
import os

html_path = os.path.abspath("diet_plan_print.html")
pdf_path = os.path.abspath("Lift_Log_Diet_Plan.pdf")

print("HTML:", html_path)
print("PDF:", pdf_path)

chrome_paths = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
]

for binary in chrome_paths:
    if os.path.exists(binary):
        print("Using binary:", binary)
        cmd = [
            binary,
            "--headless=new",
            "--disable-gpu",
            "--allow-file-access-from-files",
            "--no-pdf-header-footer",
            f"--print-to-pdf={pdf_path}",
            f"file:///{html_path.replace(os.sep, '/')}"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        print("Return code:", res.returncode)
        print("Stdout:", res.stdout)
        print("Stderr:", res.stderr)
        if os.path.exists(pdf_path):
            print("Successfully created PDF, size:", os.path.getsize(pdf_path))
            break
        else:
            print("PDF not found after running command.")
