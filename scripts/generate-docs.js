const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const {addNumberingToHeaders, addAnchorsToHeaders, transliterateLinks} = require('./helpers')

const CONFIGS = {
	ru: {
		sourceDir: path.join(__dirname, '..', 'assets', 'ru'),
		outputDir: path.join(__dirname, '..', 'src', 'docs'),
		warnPlaceholder: `\
[//]: # (====== АВТО-СГЕНЕРИРОВАННЫЙ ФАЙЛ ======)
[//]: # (ЭТОТ ФАЙЛ БЫЛ АВТОМАТИЧЕСКИ СГЕНЕРИРОВАН. ЛЮБЫЕ ПРЯМЫЕ ИЗМЕНЕНИЯ МОГУТ БЫТЬ ПЕРЕЗАПИСАНЫ.)
[//]: # (НЕ РЕДАКТИРУЙТЕ ЭТОТ ФАЙЛ НАПРЯМУЮ.)
[//]: # (ДЛЯ ОБНОВЛЕНИЯ ДОКУМЕНТАЦИИ ПЕРЕЙДИТЕ В ПАПКУ 'ASSETS/RU'.)
\n`
	},
	en: {
		sourceDir: path.join(__dirname, '..', 'assets', 'en'),
		outputDir: path.join(__dirname, '..', 'src', 'en', 'docs'),
		warnPlaceholder: `\
[//]: # (====== AUTO-GENERATED FILE ======)
[//]: # (THIS FILE WAS AUTOMATICALLY GENERATED. ANY DIRECT MODIFICATIONS MAY BE OVERWRITTEN.)
[//]: # (DO NOT MODIFY THIS FILE DIRECTLY.)
[//]: # (TO UPDATE THE DOCUMENTATION, NAVIGATE TO THE 'ASSETS/EN' FOLDER.)
\n`
	}
};

const language = process.argv[2] || 'ru';
const config = CONFIGS[language];

if (!config) {
	console.error(`Unknown language: ${language}. Available languages: ${Object.keys(CONFIGS).join(', ')}`);
	process.exit(1);
}

function generateDocs(sourceDir, outputDir, warnPlaceholder, language) {
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

	fs.readdirSync(sourceDir).forEach(file => {
		const sourcePath = path.join(sourceDir, file);
		const outputPath = path.join(outputDir, file);

		if (language === 'ru' && file === 'en')  return;

		if (file.endsWith('.md')) {
			const processedContent = generateDocFile(sourcePath, warnPlaceholder);
			fs.writeFileSync(outputPath, processedContent, 'utf-8');
			return
		}

		if (fs.lstatSync(sourcePath).isDirectory()) {
			if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

			generateDocs(sourcePath, outputPath, warnPlaceholder, language);
			return;
		}

		fs.copyFileSync(sourcePath, outputPath);
	});

	const assetsDir = path.join(__dirname, '..', 'assets');
	const imgSourceDir = path.join(assetsDir, '00-img');
	const imgOutputDir = path.join(outputDir, '00-img');
	
	if (fs.existsSync(imgSourceDir)) {
		if (!fs.existsSync(imgOutputDir)) fs.mkdirSync(imgOutputDir, { recursive: true });
		copyDirectory(imgSourceDir, imgOutputDir);
	}
}

function copyDirectory(sourceDir, outputDir) {
	fs.readdirSync(sourceDir).forEach(file => {
		const sourcePath = path.join(sourceDir, file);
		const outputPath = path.join(outputDir, file);

		if (fs.lstatSync(sourcePath).isDirectory()) {
			if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });
			copyDirectory(sourcePath, outputPath);
		} else {
			fs.copyFileSync(sourcePath, outputPath);
		}
	});
}

generateDocs(config.sourceDir, config.outputDir, config.warnPlaceholder, language)


function generateDocFile(filePath, warnPlaceholder) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const {data: frontMatter, content: markdownContent} = matter(content);

	const withTransliteratedLinks = transliterateLinks(markdownContent);
	
	const processedContent = (frontMatter?.['ignore-section-number']) ?
		addAnchorsToHeaders(withTransliteratedLinks) :
		addNumberingToHeaders(withTransliteratedLinks, frontMatter?.section ? frontMatter.section - 1 : 0);

	return matter.stringify('', frontMatter).concat(warnPlaceholder, '\n\n', processedContent);
}