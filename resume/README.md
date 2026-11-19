# Resume sources

The PDFs in `public/resume/` (linked from `/hiring`) are printed from these HTML files. Keep their
content in step with `lib/hiring.ts`. To change one, edit the HTML, then print it to a one-page PDF:

```bash
for t in software security; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
    --print-to-pdf="public/resume/matthew-vella-resume-$t-engineering.pdf" \
    "file://$PWD/resume/matthew-vella-resume-$t-engineering-print.html"
done
```
