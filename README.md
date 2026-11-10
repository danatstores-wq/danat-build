# Danat Build — first visual implementation

This is the first implemented mobile UI pass based on the supplied Danat Build concept: black/charcoal surfaces, warm gold accents, welcome screen, language selector, professional/homeowner choice, calculator dashboard, calculator navigation, and a concrete calculator with a working volume + wastage formula.

## Run
```bash
npm install
npx expo start
```

## Important scope notes
- The welcome, dashboard, navigation, calculator shell, and concrete calculation are implemented in React Native.
- Tiles, paint, blocks/bricks, sand/cement, and project-cost screens currently have designed placeholders. Their formulas, pricing inputs, saved projects, and PDF export have not yet been implemented.
- The Arabic labels are starter translations; full RTL layout and professional Arabic copy need a dedicated pass.
- Construction formulas and material assumptions must be reviewed by a qualified construction professional before real-world purchasing or building decisions.

## GitHub update
Copy these project files into your existing local repository, inspect the changes, then run:
```bash
git add .
git commit -m "Build Danat Build visual interface"
git push origin main
```
