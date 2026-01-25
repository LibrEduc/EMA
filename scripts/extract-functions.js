#!/usr/bin/env node
/**
 * Script to extract all exported functions with their JSDoc comments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');
const outputFile = path.join(__dirname, '..', 'docs', 'functions-list.md');

/**
 * Extracts JSDoc comments from a file
 */
function extractJSDocComments(content) {
  const comments = [];
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  let match;
  
  while ((match = jsdocRegex.exec(content)) !== null) {
    comments.push(match[0]);
  }
  
  return comments;
}

/**
 * Finds all JSDoc comments in the content
 */
function findAllJSDocComments(content) {
  const comments = [];
  const lines = content.split('\n');
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  let match;
  
  while ((match = jsdocRegex.exec(content)) !== null) {
    const startLine = content.substring(0, match.index).split('\n').length;
    const endLine = content.substring(0, match.index + match[0].length).split('\n').length;
    comments.push({
      text: match[0],
      startLine: startLine,
      endLine: endLine,
      index: match.index,
    });
  }
  
  return comments;
}

/**
 * Finds function definitions and their associated JSDoc
 */
function findFunctionsWithDocs(content, filePath) {
  const functions = [];
  const lines = content.split('\n');
  
  // First, find all JSDoc comments
  const allComments = findAllJSDocComments(content);
  
  // Pattern for exported functions
  const functionPatterns = [
    // export function name(...)
    /export\s+function\s+(\w+)\s*\([^)]*\)/g,
    // export const name = function(...)
    /export\s+const\s+(\w+)\s*=\s*function\s*\(/g,
    // export const name = (...)
    /export\s+const\s+(\w+)\s*=\s*\([^)]*\)\s*[:=]/g,
    // export class Name
    /export\s+class\s+(\w+)/g,
  ];
  
  functionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const funcName = match[1];
      const funcIndex = match.index;
      const funcLine = content.substring(0, funcIndex).split('\n').length;
      
      // Find the closest JSDoc comment before this function
      let jsdoc = null;
      let closestComment = null;
      let minDistance = Infinity;
      
      for (const comment of allComments) {
        // Comment must be before the function
        if (comment.endLine < funcLine) {
          const distance = funcLine - comment.endLine;
          // Prefer comments that are close (within 10 lines) and not too far
          if (distance < minDistance && distance <= 10) {
            minDistance = distance;
            closestComment = comment;
          }
        }
      }
      
      if (closestComment) {
        jsdoc = closestComment.text.trim();
      }
      
      // Extract function signature
      const funcLineContent = lines[funcLine - 1] || '';
      const signatureMatch = funcLineContent.match(/export\s+(?:function|const|class)\s+(\w+)[\s\S]*?\{/);
      const signature = signatureMatch ? signatureMatch[0].split('{')[0].trim() : funcLineContent.trim();
      
      functions.push({
        name: funcName,
        file: path.relative(srcDir, filePath),
        line: funcLine,
        signature: signature,
        jsdoc: jsdoc,
      });
    }
  });
  
  return functions;
}

/**
 * Formats JSDoc to markdown, preserving all tags and content
 */
function formatJSDoc(jsdoc) {
  if (!jsdoc) return '';
  
  // Remove opening and closing comment markers
  let formatted = jsdoc
    .replace(/\/\*\*/g, '')
    .replace(/\*\//g, '');
  
  // Remove leading asterisks and spaces from each line, but preserve content
  formatted = formatted
    .split('\n')
    .map(line => {
      // Remove leading whitespace and asterisk
      const cleaned = line.replace(/^\s*\*\s?/, '');
      return cleaned;
    })
    .filter(line => line.trim() !== '') // Remove empty lines
    .join('\n');
  
  return formatted.trim();
}

/**
 * Main function
 */
function main() {
  const allFunctions = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const functions = findFunctionsWithDocs(content, filePath);
          allFunctions.push(...functions);
        } catch (err) {
          console.error(`Error reading ${filePath}:`, err.message);
        }
      }
    });
  }
  
  walkDir(srcDir);
  
  // Sort by file, then by name
  allFunctions.sort((a, b) => {
    if (a.file !== b.file) {
      return a.file.localeCompare(b.file);
    }
    return a.name.localeCompare(b.name);
  });
  
  // Generate markdown output
  let markdown = '# Liste des fonctions exportées\n\n';
  markdown += `Total: ${allFunctions.length} fonctions\n\n`;
  markdown += '---\n\n';
  
  let currentFile = '';
  allFunctions.forEach(func => {
    if (func.file !== currentFile) {
      currentFile = func.file;
      markdown += `\n## ${currentFile}\n\n`;
    }
    
    markdown += `### ${func.name}\n\n`;
    markdown += `**Fichier:** \`${func.file}\` (ligne ${func.line})\n\n`;
    markdown += `**Signature:** \`${func.signature}\`\n\n`;
    
    if (func.jsdoc) {
      const formatted = formatJSDoc(func.jsdoc);
      markdown += `**Description:**\n\n${formatted}\n\n`;
    } else {
      markdown += `**Description:** *Aucune documentation*\n\n`;
    }
    
    markdown += '---\n\n';
  });
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputFile, markdown, 'utf8');
  console.log(`✅ ${allFunctions.length} fonctions extraites dans ${outputFile}`);
}

main();
