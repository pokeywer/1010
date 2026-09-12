// Melencion Luau Obfuscator Core Engine

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const inputCode = document.getElementById('input-code');
    const outputCode = document.getElementById('output-code');
    const obfuscateBtn = document.getElementById('obfuscate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const clearInputBtn = document.getElementById('clear-input-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const watermarkInput = document.getElementById('watermark-input');

    // Stats
    const statOrigSize = document.getElementById('stat-orig-size');
    const statObfSize = document.getElementById('stat-obf-size');
    const statRatio = document.getElementById('stat-ratio');
    const statTime = document.getElementById('stat-time');

    // Options
    const optRename = document.getElementById('opt-rename');
    const optStrings = document.getElementById('opt-strings');
    const optNumbers = document.getElementById('opt-numbers');
    const optJunk = document.getElementById('opt-junk');
    const optVm = document.getElementById('opt-vm');
    const optAntiDump = document.getElementById('opt-anti-dump');

    // Preset Configurations
    const presets = {
        low: { rename: true, strings: false, numbers: false, junk: false, vm: false, antiDump: false },
        medium: { rename: true, strings: true, numbers: true, junk: false, vm: false, antiDump: false },
        high: { rename: true, strings: true, numbers: true, junk: true, vm: false, antiDump: true },
        extreme: { rename: true, strings: true, numbers: true, junk: true, vm: true, antiDump: true }
    };

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const level = btn.dataset.level;
            const config = presets[level];
            
            optRename.checked = config.rename;
            optStrings.checked = config.strings;
            optNumbers.checked = config.numbers;
            optJunk.checked = config.junk;
            optVm.checked = config.vm;
            optAntiDump.checked = config.antiDump;
        });
    });

    // Random Name Generator (Hex / Homoglyphs)
    function generateVarName(length = 8) {
        const chars = 'lI1_0x';
        let res = '_0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
        return res;
    }

    // Luau Obfuscator Pipeline
    function obfuscateLuau(code) {
        const startTime = performance.now();
        let result = code;

        if (!result.trim()) return '';

        // 1. Remove standard comments
        result = result.replace(/--\[\[[\s\S]*?\]\]/g, '');
        result = result.replace(/--.*$/gm, '');

        // 2. String Encoding (Turn strings into byte char arrays)
        if (optStrings.checked) {
            result = result.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
                const inner = match.slice(1, -1);
                if (inner.length === 0) return match;
                
                const bytes = Array.from(inner).map(c => '\\' + c.charCodeAt(0));
                return `"${bytes.join('')}"`;
            });
        }

        // 3. Number Arithmetic Obfuscation
        if (optNumbers.checked) {
            result = result.replace(/\b\d+\b/g, (match) => {
                const num = parseInt(match, 10);
                if (isNaN(num) || num > 99999) return match;
                const r1 = Math.floor(Math.random() * 50) + 1;
                const r2 = num + r1;
                return `(${r2} - ${r1})`;
            });
        }

        // 4. Variable & Local Function Mangling
        if (optRename.checked) {
            const varMap = new Map();
            const localVars = result.match(/local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
            
            localVars.forEach(decl => {
                const varName = decl.replace('local', '').trim();
                if (!['script', 'game', 'workspace', 'shared', '_G'].includes(varName) && !varMap.has(varName)) {
                    varMap.set(varName, generateVarName());
                }
            });

            varMap.forEach((newName, oldName) => {
                const regex = new RegExp(`\\b${oldName}\\b`, 'g');
                result = result.replace(regex, newName);
            });
        }

        // 5. Dead Code / Junk Injection
        if (optJunk.checked) {
            const junkLines = [
                `local ${generateVarName()} = math.sin(${Math.floor(Math.random() * 100)});`,
                `if false then local ${generateVarName()} = "${generateVarName()}"; end`,
                `local ${generateVarName()} = bit32 and bit32.bxor(10, 20) or 0;`
            ];
            const lines = result.split('\n');
            let injected = [];
            lines.forEach(line => {
                injected.push(line);
                if (Math.random() < 0.3 && line.trim().length > 0) {
                    injected.push(junkLines[Math.floor(Math.random() * junkLines.length)]);
                }
            });
            result = injected.join('\n');
        }

        // 6. Anti-Dump / Anti-Decompile Header
        let header = '';
        if (optAntiDump.checked) {
            header += `--[[ ${watermarkInput.value || 'Melencion Secured'} ]]\n`;
            header += `if not LUA_ENV then pcall(function() setfenv(1, setmetatable({}, {__index = function() return end})) end) end\n`;
        } else if (watermarkInput.value) {
            header += `--[[ ${watermarkInput.value} ]]\n`;
        }

        result = header + result;

        // 7. XOR Virtual Machine Wrapper (Luraph-style byte array unpacker)
        if (optVm.checked) {
            const xorKey = Math.floor(Math.random() * 200) + 20;
            const charCodes = [];
            for (let i = 0; i < result.length; i++) {
                charCodes.push(result.charCodeAt(i) ^ xorKey);
            }

            const byteArrayStr = charCodes.join(',');
            const vmVar = generateVarName();
            const keyVar = generateVarName();
            const strVar = generateVarName();
            const funcVar = generateVarName();

            result = `--[[ Luraph-style VM Obfuscation by Melencion ]]--\n` +
            `local ${vmVar} = {${byteArrayStr}}\n` +
            `local ${keyVar} = ${xorKey}\n` +
            `local ${strVar} = ""\n` +
            `for i = 1, #${vmVar} do\n` +
            `    ${strVar} = ${strVar} .. string.char(bit32.bxor(${vmVar}[i], ${keyVar}))\n` +
            `end\n` +
            `local ${funcVar} = assert(loadstring or load)(${strVar})\n` +
            `return ${funcVar}()`;
        }

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        // Update Stats
        const origBytes = new Blob([code]).size;
        const obfBytes = new Blob([result]).size;
        
        statOrigSize.textContent = formatBytes(origBytes);
        statObfSize.textContent = formatBytes(obfBytes);
        statRatio.textContent = (obfBytes / (origBytes || 1)).toFixed(2) + 'x';
        statTime.textContent = duration + 'ms';

        return result;
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Actions
    obfuscateBtn.addEventListener('click', () => {
        outputCode.value = obfuscateLuau(inputCode.value);
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
        a.download = 'obfuscated_script.lua';
        a.click();
        URL.revokeObjectURL(url);
    });

    clearInputBtn.addEventListener('click', () => {
        inputCode.value = '';
        outputCode.value = '';
        statOrigSize.textContent = '0 B';
        statObfSize.textContent = '0 B';
        statRatio.textContent = '0x';
        statTime.textContent = '0ms';
    });
});