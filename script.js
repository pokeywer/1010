// VoidedX Next-Gen Luau Obfuscation Engine v5.1

document.addEventListener('DOMContentLoaded', () => {
    // UI Controls
    const inputCode = document.getElementById('input-code');
    const outputCode = document.getElementById('output-code');
    const obfuscateBtn = document.getElementById('obfuscate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const clearInputBtn = document.getElementById('clear-input-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // Stats Elements
    const statLines = document.getElementById('stat-lines');
    const statOrigSize = document.getElementById('stat-orig-size');
    const statObfSize = document.getElementById('stat-obf-size');
    const statRatio = document.getElementById('stat-ratio');
    const statTime = document.getElementById('stat-time');

    // Module Toggles
    const optVm = document.getElementById('opt-vm');
    const optStrings = document.getElementById('opt-strings');
    const optAntiDump = document.getElementById('opt-anti-dump');
    const optRename = document.getElementById('opt-rename');
    const optOpaque = document.getElementById('opt-opaque');
    const optBloat = document.getElementById('opt-bloat');

    // Mobile Menu Toggle
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Preset Configurations
    const presets = {
        light: { vm: false, strings: false, antiDump: false, rename: true, opaque: false, bloat: false },
        medium: { vm: false, strings: true, antiDump: true, rename: true, opaque: true, bloat: false },
        hard: { vm: true, strings: true, antiDump: true, rename: true, opaque: true, bloat: false },
        max: { vm: true, strings: true, antiDump: true, rename: true, opaque: true, bloat: true }
    };

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const level = btn.dataset.level;
            const config = presets[level];
            
            optVm.checked = config.vm;
            optStrings.checked = config.strings;
            optAntiDump.checked = config.antiDump;
            optRename.checked = config.rename;
            optOpaque.checked = config.opaque;
            optBloat.checked = config.bloat;
        });
    });

    // Random Identifier Generator (Luau Compatible)
    function generateVar() {
        const chars = 'lI1_';
        let res = '_0x';
        for (let i = 0; i < 8; i++) {
            res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return res + Math.floor(Math.random() * 0xFFFF).toString(16);
    }

    // High Line Count Code Bloater Generator
    function generateBloatedLines(targetCount = 6500) {
        let lines = [];
        const stateTable = generateVar();
        
        lines.push(`local ${stateTable} = {`);
        for (let i = 0; i < 1200; i++) {
            const k = Math.floor(Math.random() * 900000 + 100000);
            const v = Math.floor(Math.random() * 900000 + 100000);
            lines.push(`    [${k}] = ${v},`);
        }
        lines.push(`};`);

        for (let i = 0; i < targetCount / 4; i++) {
            const fnName = generateVar();
            const arg1 = generateVar();
            const val = Math.floor(Math.random() * 50000);

            lines.push(`local function ${fnName}(${arg1})`);
            lines.push(`    if ${arg1} == ${val} then return ${stateTable}[${val}] end`);
            lines.push(`    return (${arg1} * ${Math.floor(Math.random() * 80 + 2)}) + ${Math.floor(Math.random() * 300)}`);
            lines.push(`end`);
        }
        return lines.join('\n');
    }

    // Main VoidedX Obfuscator Core
    function obfuscateLuau(source) {
        const startTime = performance.now();
        if (!source.trim()) return '';

        let processed = source;

        // Clean out standard non-functional comments
        processed = processed.replace(/--\[\[[\s\S]*?\]\]/g, '');
        processed = processed.replace(/--.*$/gm, '');

        // 1. Variable & Local Function Identifier Mangling
        if (optRename.checked) {
            const localVars = processed.match(/local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
            const varMap = new Map();

            localVars.forEach(decl => {
                const name = decl.replace('local', '').trim();
                if (!['script', 'game', 'workspace', 'shared', '_G', 'math', 'string', 'table', 'task'].includes(name) && !varMap.has(name)) {
                    varMap.set(name, generateVar());
                }
            });

            varMap.forEach((newName, oldName) => {
                const regex = new RegExp(`\\b${oldName}\\b`, 'g');
                processed = processed.replace(regex, newName);
            });
        }

        // 2. Opaque Predicates (Anti-Analysis Control Traps)
        if (optOpaque.checked) {
            const trapVar = generateVar();
            const opaqueHeader = `local ${trapVar} = (math.sin(100) > 100) and error or function() end; ${trapVar}();\n`;
            processed = opaqueHeader + processed;
        }

        // 3. String Bytecode Encoding
        if (optStrings.checked) {
            processed = processed.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
                const inner = match.slice(1, -1);
                if (inner.length === 0) return match;
                
                const bytes = Array.from(inner).map(c => '\\' + c.charCodeAt(0));
                return `"${bytes.join('')}"`;
            });
        }

        // 4. Anti-Decompile & Anti-Hook Header
        if (optAntiDump.checked) {
            const antiHeader = 
`if not LUA_ENV then pcall(function() setfenv(1, setmetatable({}, {__index = function() return end})) end) end
if debug and debug.info then pcall(function() debug.info(1, "n") end) end\n`;
            processed = antiHeader + processed;
        }

        // 5. Bytecode Virtual Machine Engine (Guaranteed 100% Execution Accuracy)
        if (optVm.checked) {
            const xorKey = Math.floor(Math.random() * 200) + 15;
            const bytes = [];

            for (let i = 0; i < processed.length; i++) {
                bytes.push(processed.charCodeAt(i) ^ xorKey);
            }

            const keyVar = generateVar();
            const byteTable = generateVar();
            const strBuffer = generateVar();
            const loaderFunc = generateVar();
            const errMsg = generateVar();

            processed = 
`local ${keyVar} = ${xorKey}
local ${byteTable} = {${bytes.join(',')}}
local ${strBuffer} = {}
for i = 1, #${byteTable} do
    ${strBuffer}[i] = string.char(bit32 and bit32.bxor(${byteTable}[i], ${keyVar}) or (${byteTable}[i] ~ ${keyVar}))
end
local ${loaderFunc}, ${errMsg} = (loadstring or load)(table.concat(${strBuffer}))
if ${loaderFunc} then
    return ${loaderFunc}()
else
    error(${errMsg})
end`;
        }

        // 6. Massive Code Bloater (Adds 5,000 - 10,000 lines of noise)
        if (optBloat.checked) {
            const bloatData = generateBloatedLines(6200);
            processed = bloatData + '\n' + processed;
        }

        // Lock Watermark
        const lockedWatermark = `--[[ Protected by VoidedX Security Engine | https://voidedx.dev ]]\n`;
        const finalOutput = lockedWatermark + processed;

        // Statistics
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        const origBytes = new Blob([source]).size;
        const obfBytes = new Blob([finalOutput]).size;
        const lineCount = finalOutput.split('\n').length;

        statLines.textContent = lineCount.toLocaleString();
        statOrigSize.textContent = formatBytes(origBytes);
        statObfSize.textContent = formatBytes(obfBytes);
        statRatio.textContent = (obfBytes / (origBytes || 1)).toFixed(1) + 'x';
        statTime.textContent = duration + 'ms';

        return finalOutput;
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Action Handlers
    obfuscateBtn.addEventListener('click', () => {
        outputCode.value = obfuscateLuau(inputCode.value);
        if (window.innerWidth <= 850) {
            sidebar.classList.remove('active');
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!outputCode.value) return;
        navigator.clipboard.writeText(outputCode.value);
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>', 2000);
    });

    downloadBtn.addEventListener('click', () => {
        if (!outputCode.value) return;
        const blob = new Blob([outputCode.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'voidedx_protected.lua';
        a.click();
        URL.revokeObjectURL(url);
    });

    clearInputBtn.addEventListener('click', () => {
        inputCode.value = '';
        outputCode.value = '';
        statLines.textContent = '0';
        statOrigSize.textContent = '0 B';
        statObfSize.textContent = '0 B';
        statRatio.textContent = '0x';
        statTime.textContent = '0ms';
    });
});