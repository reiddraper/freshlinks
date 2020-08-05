"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_markdown_links = void 0;
const commonmark_1 = require("commonmark");
const fs_1 = require("fs");
function parse_markdown_links(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileContents = yield fs_1.promises.readFile(filename, 'utf-8');
        const reader = new commonmark_1.Parser();
        const parsed = reader.parse(fileContents);
        var walker = parsed.walker();
        let event, node;
        let links = [];
        while ((event = walker.next())) {
            node = event.node;
            if (event.entering && node.type === 'link') {
                if (node.destination && node.parent) {
                    const [[startLine, startCol], [endLine, endCol]] = node.parent.sourcepos;
                    const link = {
                        sourceFile: filename,
                        link: node.destination,
                        startLine: startLine,
                        startCol: startLine,
                        endLine: endLine,
                        endCol: endCol
                    };
                    links.push(link);
                }
            }
        }
        return links;
    });
}
exports.parse_markdown_links = parse_markdown_links;
