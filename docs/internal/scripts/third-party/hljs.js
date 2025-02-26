var hljs = (function () {
    'use strict'
    var e = { exports: {} }
    function t(n) {
        return (
            n instanceof Map
                ? (n.clear =
                      n.delete =
                      n.set =
                          function () {
                              throw new Error('map is read-only')
                          })
                : n instanceof Set &&
                  (n.add =
                      n.clear =
                      n.delete =
                          function () {
                              throw new Error('set is read-only')
                          }),
            Object.freeze(n),
            Object.getOwnPropertyNames(n).forEach(function (e) {
                e = n[e]
                'object' != typeof e || Object.isFrozen(e) || t(e)
            }),
            n
        )
    }
    ;(e.exports = t), (e.exports.default = t)
    var z = e.exports
    class D {
        constructor(e) {
            void 0 === e.data && (e.data = {}),
                (this.data = e.data),
                (this.isMatchIgnored = !1)
        }
        ignoreMatch() {
            this.isMatchIgnored = !0
        }
    }
    function n(e) {
        return e
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
    }
    function l(e, ...n) {
        const t = Object.create(null)
        for (const a in e) t[a] = e[a]
        return (
            n.forEach(function (e) {
                for (const n in e) t[n] = e[n]
            }),
            t
        )
    }
    const a = (e) => !!e.kind
    class T {
        constructor(e, n) {
            ;(this.buffer = ''),
                (this.classPrefix = n.classPrefix),
                e.walk(this)
        }
        addText(e) {
            this.buffer += n(e)
        }
        openNode(n) {
            if (a(n)) {
                let e = n.kind
                ;(e = n.sublanguage
                    ? 'language-' + e
                    : ((e, { prefix: n }) => {
                          if (e.includes('.')) {
                              const t = e.split('.')
                              return [
                                  '' + n + t.shift(),
                                  ...t.map(
                                      (e, n) => '' + e + '_'.repeat(n + 1)
                                  ),
                              ].join(' ')
                          }
                          return '' + n + e
                      })(e, { prefix: this.classPrefix })),
                    this.span(e)
            }
        }
        closeNode(e) {
            a(e) && (this.buffer += '</span>')
        }
        value() {
            return this.buffer
        }
        span(e) {
            this.buffer += `<span class="${e}">`
        }
    }
    class i {
        constructor() {
            ;(this.rootNode = { children: [] }), (this.stack = [this.rootNode])
        }
        get top() {
            return this.stack[this.stack.length - 1]
        }
        get root() {
            return this.rootNode
        }
        add(e) {
            this.top.children.push(e)
        }
        openNode(e) {
            e = { kind: e, children: [] }
            this.add(e), this.stack.push(e)
        }
        closeNode() {
            if (1 < this.stack.length) return this.stack.pop()
        }
        closeAllNodes() {
            for (; this.closeNode(); );
        }
        toJSON() {
            return JSON.stringify(this.rootNode, null, 4)
        }
        walk(e) {
            return this.constructor._walk(e, this.rootNode)
        }
        static _walk(n, e) {
            return (
                'string' == typeof e
                    ? n.addText(e)
                    : e.children &&
                      (n.openNode(e),
                      e.children.forEach((e) => this._walk(n, e)),
                      n.closeNode(e)),
                n
            )
        }
        static _collapse(e) {
            'string' != typeof e &&
                e.children &&
                (e.children.every((e) => 'string' == typeof e)
                    ? (e.children = [e.children.join('')])
                    : e.children.forEach((e) => {
                          i._collapse(e)
                      }))
        }
    }
    class L extends i {
        constructor(e) {
            super(), (this.options = e)
        }
        addKeyword(e, n) {
            '' !== e && (this.openNode(n), this.addText(e), this.closeNode())
        }
        addText(e) {
            '' !== e && this.add(e)
        }
        addSublanguage(e, n) {
            const t = e.root
            ;(t.kind = n), (t.sublanguage = !0), this.add(t)
        }
        toHTML() {
            const e = new T(this, this.options)
            return e.value()
        }
        finalize() {
            return !0
        }
    }
    function c(e) {
        return e ? ('string' == typeof e ? e : e.source) : null
    }
    function k(e) {
        return O('(?=', e, ')')
    }
    function O(...e) {
        return e.map((e) => c(e)).join('')
    }
    function d(...e) {
        var n,
            t =
                'object' == typeof (n = (t = e)[t.length - 1]) &&
                n.constructor === Object
                    ? (t.splice(t.length - 1, 1), n)
                    : {}
        return (
            '(' + (t.capture ? '' : '?:') + e.map((e) => c(e)).join('|') + ')'
        )
    }
    function u(e) {
        return new RegExp(e.toString() + '|').exec('').length - 1
    }
    const I = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./
    function g(e, { joinWith: n }) {
        let r = 0
        return e
            .map((e) => {
                var n = (r += 1)
                let t = c(e),
                    a = ''
                for (; 0 < t.length; ) {
                    var i = I.exec(t)
                    if (!i) {
                        a += t
                        break
                    }
                    ;(a += t.substring(0, i.index)),
                        (t = t.substring(i.index + i[0].length)),
                        '\\' === i[0][0] && i[1]
                            ? (a += '\\' + String(Number(i[1]) + n))
                            : ((a += i[0]), '(' === i[0] && r++)
                }
                return a
            })
            .map((e) => `(${e})`)
            .join(n)
    }
    function r(e, n, t = {}) {
        const a = l({ scope: 'comment', begin: e, end: n, contains: [] }, t)
        return (
            a.contains.push({
                scope: 'doctag',
                begin: '[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)',
                end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
                excludeBegin: !0,
                relevance: 0,
            }),
            (e = d(
                'I',
                'a',
                'is',
                'so',
                'us',
                'to',
                'at',
                'if',
                'in',
                'it',
                'on',
                /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
                /[A-Za-z]+[-][a-z]+/,
                /[A-Za-z][a-z]{2,}/
            )),
            a.contains.push({
                begin: O(/[ ]+/, '(', e, /[.]?[:]?([.][ ]|[ ])/, '){3}'),
            }),
            a
        )
    }
    var e = '[a-zA-Z]\\w*',
        s = '[a-zA-Z_]\\w*',
        o = '\\b\\d+(\\.\\d+)?',
        b =
            '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)',
        h = '\\b(0b[01]+)',
        p = { begin: '\\\\[\\s\\S]', relevance: 0 },
        m = {
            scope: 'string',
            begin: "'",
            end: "'",
            illegal: '\\n',
            contains: [p],
        },
        f = {
            scope: 'string',
            begin: '"',
            end: '"',
            illegal: '\\n',
            contains: [p],
        },
        E = r('//', '$'),
        v = r('/\\*', '\\*/'),
        w = r('#', '$'),
        y = Object.freeze({
            __proto__: null,
            MATCH_NOTHING_RE: /\b\B/,
            IDENT_RE: e,
            UNDERSCORE_IDENT_RE: s,
            NUMBER_RE: o,
            C_NUMBER_RE: b,
            BINARY_NUMBER_RE: h,
            RE_STARTERS_RE:
                '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~',
            SHEBANG: (e = {}) => {
                var n = /^#![ ]*\//
                return (
                    e.binary && (e.begin = O(n, /.*\b/, e.binary, /\b.*/)),
                    l(
                        {
                            scope: 'meta',
                            begin: n,
                            end: /$/,
                            relevance: 0,
                            'on:begin': (e, n) => {
                                0 !== e.index && n.ignoreMatch()
                            },
                        },
                        e
                    )
                )
            },
            BACKSLASH_ESCAPE: p,
            APOS_STRING_MODE: m,
            QUOTE_STRING_MODE: f,
            PHRASAL_WORDS_MODE: {
                begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/,
            },
            COMMENT: r,
            C_LINE_COMMENT_MODE: E,
            C_BLOCK_COMMENT_MODE: v,
            HASH_COMMENT_MODE: w,
            NUMBER_MODE: { scope: 'number', begin: o, relevance: 0 },
            C_NUMBER_MODE: { scope: 'number', begin: b, relevance: 0 },
            BINARY_NUMBER_MODE: { scope: 'number', begin: h, relevance: 0 },
            REGEXP_MODE: {
                begin: /(?=\/[^/\n]*\/)/,
                contains: [
                    {
                        scope: 'regexp',
                        begin: /\//,
                        end: /\/[gimuy]*/,
                        illegal: /\n/,
                        contains: [
                            p,
                            {
                                begin: /\[/,
                                end: /\]/,
                                relevance: 0,
                                contains: [p],
                            },
                        ],
                    },
                ],
            },
            TITLE_MODE: { scope: 'title', begin: e, relevance: 0 },
            UNDERSCORE_TITLE_MODE: { scope: 'title', begin: s, relevance: 0 },
            METHOD_GUARD: { begin: '\\.\\s*' + s, relevance: 0 },
            END_SAME_AS_BEGIN: function (e) {
                return Object.assign(e, {
                    'on:begin': (e, n) => {
                        n.data._beginMatch = e[1]
                    },
                    'on:end': (e, n) => {
                        n.data._beginMatch !== e[1] && n.ignoreMatch()
                    },
                })
            },
        })
    function $(e, n) {
        '.' === e.input[e.index - 1] && n.ignoreMatch()
    }
    function P(e, n) {
        void 0 !== e.className && ((e.scope = e.className), delete e.className)
    }
    function U(e, n) {
        n &&
            e.beginKeywords &&
            ((e.begin =
                '\\b(' +
                e.beginKeywords.split(' ').join('|') +
                ')(?!\\.)(?=\\b|\\s)'),
            (e.__beforeBegin = $),
            (e.keywords = e.keywords || e.beginKeywords),
            delete e.beginKeywords,
            void 0 === e.relevance && (e.relevance = 0))
    }
    function H(e, n) {
        Array.isArray(e.illegal) && (e.illegal = d(...e.illegal))
    }
    function Z(e, n) {
        if (e.match) {
            if (e.begin || e.end)
                throw new Error('begin & end are not supported with match')
            ;(e.begin = e.match), delete e.match
        }
    }
    function G(e, n) {
        void 0 === e.relevance && (e.relevance = 1)
    }
    const K = (n, e) => {
            if (n.beforeMatch) {
                if (n.starts)
                    throw new Error('beforeMatch cannot be used with starts')
                const t = Object.assign({}, n)
                Object.keys(n).forEach((e) => {
                    delete n[e]
                }),
                    (n.keywords = t.keywords),
                    (n.begin = O(t.beforeMatch, k(t.begin))),
                    (n.starts = {
                        relevance: 0,
                        contains: [Object.assign(t, { endsParent: !0 })],
                    }),
                    (n.relevance = 0),
                    delete t.beforeMatch
            }
        },
        X = [
            'of',
            'and',
            'for',
            'in',
            'not',
            'or',
            'if',
            'then',
            'parent',
            'list',
            'value',
        ],
        W = 'keyword'
    function _(n, t, e = W) {
        const a = Object.create(null)
        return (
            'string' == typeof n
                ? i(e, n.split(' '))
                : Array.isArray(n)
                ? i(e, n)
                : Object.keys(n).forEach(function (e) {
                      Object.assign(a, _(n[e], t, e))
                  }),
            a
        )
        function i(n, e) {
            ;(e = t ? e.map((e) => e.toLowerCase()) : e).forEach(function (e) {
                e = e.split('|')
                a[e[0]] = [
                    n,
                    (function (e, n) {
                        if (n) return Number(n)
                        return (function (e) {
                            return X.includes(e.toLowerCase())
                        })(e)
                            ? 0
                            : 1
                    })(e[0], e[1]),
                ]
            })
        }
    }
    const N = {},
        j = (e) => {
            console.error(e)
        },
        x = (e, ...n) => {
            console.log('WARN: ' + e, ...n)
        },
        A = (e, n) => {
            N[e + '/' + n] ||
                (console.log(`Deprecated as of ${e}. ` + n),
                (N[e + '/' + n] = !0))
        },
        S = new Error()
    function M(e, n, { key: t }) {
        let a = 0
        var i = e[t]
        const r = {},
            s = {}
        for (let e = 1; e <= n.length; e++)
            (s[e + a] = i[e]), (r[e + a] = !0), (a += u(n[e - 1]))
        ;(e[t] = s), (e[t]._emit = r), (e[t]._multi = !0)
    }
    function q(e) {
        ;(n = e).scope &&
            'object' == typeof n.scope &&
            null !== n.scope &&
            ((n.beginScope = n.scope), delete n.scope),
            'string' == typeof e.beginScope &&
                (e.beginScope = { _wrap: e.beginScope }),
            'string' == typeof e.endScope &&
                (e.endScope = { _wrap: e.endScope })
        var n = e
        if (Array.isArray(n.begin)) {
            if (n.skip || n.excludeBegin || n.returnBegin)
                throw (
                    (j(
                        'skip, excludeBegin, returnBegin not compatible with beginScope: {}'
                    ),
                    S)
                )
            if ('object' != typeof n.beginScope || null === n.beginScope)
                throw (j('beginScope must be object'), S)
            M(n, n.begin, { key: 'beginScope' }),
                (n.begin = g(n.begin, { joinWith: '' }))
        }
        n = e
        if (Array.isArray(n.end)) {
            if (n.skip || n.excludeEnd || n.returnEnd)
                throw (
                    (j(
                        'skip, excludeEnd, returnEnd not compatible with endScope: {}'
                    ),
                    S)
                )
            if ('object' != typeof n.endScope || null === n.endScope)
                throw (j('endScope must be object'), S)
            M(n, n.end, { key: 'endScope' }),
                (n.end = g(n.end, { joinWith: '' }))
        }
    }
    function Q(r) {
        function s(e, n) {
            return new RegExp(
                c(e),
                'm' + (r.case_insensitive ? 'i' : '') + (n ? 'g' : '')
            )
        }
        class n {
            constructor() {
                ;(this.matchIndexes = {}),
                    (this.regexes = []),
                    (this.matchAt = 1),
                    (this.position = 0)
            }
            addRule(e, n) {
                ;(n.position = this.position++),
                    (this.matchIndexes[this.matchAt] = n),
                    this.regexes.push([n, e]),
                    (this.matchAt += u(e) + 1)
            }
            compile() {
                0 === this.regexes.length && (this.exec = () => null)
                var e = this.regexes.map((e) => e[1])
                ;(this.matcherRe = s(g(e, { joinWith: '|' }), !0)),
                    (this.lastIndex = 0)
            }
            exec(e) {
                this.matcherRe.lastIndex = this.lastIndex
                const n = this.matcherRe.exec(e)
                if (!n) return null
                var e = n.findIndex((e, n) => 0 < n && void 0 !== e),
                    t = this.matchIndexes[e]
                return n.splice(0, e), Object.assign(n, t)
            }
        }
        class o {
            constructor() {
                ;(this.rules = []),
                    (this.multiRegexes = []),
                    (this.count = 0),
                    (this.lastIndex = 0),
                    (this.regexIndex = 0)
            }
            getMatcher(e) {
                if (this.multiRegexes[e]) return this.multiRegexes[e]
                const t = new n()
                return (
                    this.rules.slice(e).forEach(([e, n]) => t.addRule(e, n)),
                    t.compile(),
                    (this.multiRegexes[e] = t)
                )
            }
            resumingScanAtSamePosition() {
                return 0 !== this.regexIndex
            }
            considerAll() {
                this.regexIndex = 0
            }
            addRule(e, n) {
                this.rules.push([e, n]), 'begin' === n.type && this.count++
            }
            exec(e) {
                const n = this.getMatcher(this.regexIndex)
                n.lastIndex = this.lastIndex
                let t = n.exec(e)
                if (
                    this.resumingScanAtSamePosition() &&
                    (!t || t.index !== this.lastIndex)
                ) {
                    const a = this.getMatcher(0)
                    ;(a.lastIndex = this.lastIndex + 1), (t = a.exec(e))
                }
                return (
                    t &&
                        ((this.regexIndex += t.position + 1),
                        this.regexIndex === this.count && this.considerAll()),
                    t
                )
            }
        }
        if (
            (r.compilerExtensions || (r.compilerExtensions = []),
            r.contains && r.contains.includes('self'))
        )
            throw new Error(
                'ERR: contains `self` is not supported at the top-level of a language.  See documentation.'
            )
        return (
            (r.classNameAliases = l(r.classNameAliases || {})),
            (function n(t, a) {
                const i = t
                if (!t.isCompiled) {
                    ;[P, Z, q, K].forEach((e) => e(t, a)),
                        r.compilerExtensions.forEach((e) => e(t, a)),
                        (t.__beforeBegin = null),
                        [U, H, G].forEach((e) => e(t, a)),
                        (t.isCompiled = !0)
                    let e = null
                    'object' == typeof t.keywords &&
                        t.keywords.$pattern &&
                        ((t.keywords = Object.assign({}, t.keywords)),
                        (e = t.keywords.$pattern),
                        delete t.keywords.$pattern),
                        (e = e || /\w+/),
                        t.keywords &&
                            (t.keywords = _(t.keywords, r.case_insensitive)),
                        (i.keywordPatternRe = s(e, !0)),
                        a &&
                            (t.begin || (t.begin = /\B|\b/),
                            (i.beginRe = s(t.begin)),
                            t.end || t.endsWithParent || (t.end = /\B|\b/),
                            t.end && (i.endRe = s(t.end)),
                            (i.terminatorEnd = c(t.end) || ''),
                            t.endsWithParent &&
                                a.terminatorEnd &&
                                (i.terminatorEnd +=
                                    (t.end ? '|' : '') + a.terminatorEnd)),
                        t.illegal && (i.illegalRe = s(t.illegal)),
                        t.contains || (t.contains = []),
                        (t.contains = [].concat(
                            ...t.contains.map(function (e) {
                                var n = 'self' === e ? t : e
                                return (
                                    n.variants &&
                                        !n.cachedVariants &&
                                        (n.cachedVariants = n.variants.map(
                                            function (e) {
                                                return l(
                                                    n,
                                                    { variants: null },
                                                    e
                                                )
                                            }
                                        )),
                                    n.cachedVariants ||
                                        ((function e(n) {
                                            return (
                                                !!n &&
                                                (n.endsWithParent ||
                                                    e(n.starts))
                                            )
                                        })(n)
                                            ? l(n, {
                                                  starts: n.starts
                                                      ? l(n.starts)
                                                      : null,
                                              })
                                            : Object.isFrozen(n)
                                            ? l(n)
                                            : n)
                                )
                            })
                        )),
                        t.contains.forEach(function (e) {
                            n(e, i)
                        }),
                        t.starts && n(t.starts, a),
                        (i.matcher = (function (e) {
                            const n = new o()
                            return (
                                e.contains.forEach((e) =>
                                    n.addRule(e.begin, {
                                        rule: e,
                                        type: 'begin',
                                    })
                                ),
                                e.terminatorEnd &&
                                    n.addRule(e.terminatorEnd, { type: 'end' }),
                                e.illegal &&
                                    n.addRule(e.illegal, { type: 'illegal' }),
                                n
                            )
                        })(i))
                }
                return i
            })(r)
        )
    }
    const C = n,
        F = l,
        J = Symbol('nomatch')
    m = (function (a) {
        const O = Object.create(null),
            r = Object.create(null),
            i = []
        let S = !0
        const M =
                "Could not find the language '{}', did you forget to load/include a language module?",
            s = { disableAutodetect: !0, name: 'Plain text', contains: [] }
        let R = {
            ignoreUnescapedHTML: !1,
            noHighlightRe: /^(no-?highlight)$/i,
            languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
            classPrefix: 'hljs-',
            cssSelector: 'pre code',
            languages: null,
            __emitter: L,
        }
        function o(e) {
            return R.noHighlightRe.test(e)
        }
        function l(e, n, t, a) {
            let i = '',
                r = ''
            'object' == typeof n
                ? ((i = e),
                  (t = n.ignoreIllegals),
                  (r = n.language),
                  (a = void 0))
                : (A(
                      '10.7.0',
                      'highlight(lang, code, ...args) has been deprecated.'
                  ),
                  A(
                      '10.7.0',
                      'Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277'
                  ),
                  (r = e),
                  (i = n)),
                void 0 === t && (t = !0)
            e = { code: i, language: r }
            u('before:highlight', e)
            const s = e.result || B(e.language, e.code, t, a)
            return (s.code = e.code), u('after:highlight', s), s
        }
        function B(r, s, o, e) {
            const l = Object.create(null)
            function c() {
                if (m.keywords) {
                    let e = 0,
                        n =
                            ((m.keywordPatternRe.lastIndex = 0),
                            m.keywordPatternRe.exec(v)),
                        t = ''
                    for (; n; ) {
                        t += v.substring(e, n.index)
                        var a = p.case_insensitive ? n[0].toLowerCase() : n[0],
                            i = m.keywords[a]
                        if (i) {
                            const [r, s] = i
                            E.addText(t),
                                (t = ''),
                                (l[a] = (l[a] || 0) + 1),
                                l[a] <= 7 && (w += s),
                                r.startsWith('_')
                                    ? (t += n[0])
                                    : ((i = p.classNameAliases[r] || r),
                                      E.addKeyword(n[0], i))
                        } else t += n[0]
                        ;(e = m.keywordPatternRe.lastIndex),
                            (n = m.keywordPatternRe.exec(v))
                    }
                    ;(t += v.substr(e)), E.addText(t)
                } else E.addText(v)
            }
            function d() {
                ;(null != m.subLanguage
                    ? function () {
                          if ('' !== v) {
                              let e = null
                              if ('string' == typeof m.subLanguage) {
                                  if (!O[m.subLanguage]) return E.addText(v)
                                  ;(e = B(
                                      m.subLanguage,
                                      v,
                                      !0,
                                      f[m.subLanguage]
                                  )),
                                      (f[m.subLanguage] = e._top)
                              } else
                                  e = T(
                                      v,
                                      m.subLanguage.length
                                          ? m.subLanguage
                                          : null
                                  )
                              0 < m.relevance && (w += e.relevance),
                                  E.addSublanguage(e._emitter, e.language)
                          }
                      }
                    : c)(),
                    (v = '')
            }
            function i(e, n) {
                let t = 1
                for (; void 0 !== n[t]; ) {
                    var a, i
                    e._emit[t]
                        ? ((a = p.classNameAliases[e[t]] || e[t]),
                          (i = n[t]),
                          a ? E.addKeyword(i, a) : ((v = i), c(), (v = '')),
                          t++)
                        : t++
                }
            }
            function u(e, n) {
                e.scope &&
                    'string' == typeof e.scope &&
                    E.openNode(p.classNameAliases[e.scope] || e.scope),
                    e.beginScope &&
                        (e.beginScope._wrap
                            ? (E.addKeyword(
                                  v,
                                  p.classNameAliases[e.beginScope._wrap] ||
                                      e.beginScope._wrap
                              ),
                              (v = ''))
                            : e.beginScope._multi &&
                              (i(e.beginScope, n), (v = ''))),
                    (m = Object.create(e, { parent: { value: m } }))
            }
            function g(e) {
                var n,
                    t = e[0],
                    a = e.rule,
                    i = new D(a)
                for (const r of [a.__beforeBegin, a['on:begin']])
                    if (r && (r(e, i), i.isMatchIgnored))
                        return (
                            (n = t),
                            0 === m.matcher.regexIndex
                                ? ((v += n[0]), 1)
                                : ((N = !0), 0)
                        )
                return (
                    a.skip
                        ? (v += t)
                        : (a.excludeBegin && (v += t),
                          d(),
                          a.returnBegin || a.excludeBegin || (v = t)),
                    u(a, e),
                    a.returnBegin ? 0 : t.length
                )
            }
            function b(e) {
                var n = e[0],
                    t = s.substr(e.index),
                    a = (function e(n, t, a) {
                        ;(r = n.endRe), (s = a)
                        let i = (r = r && r.exec(s)) && 0 === r.index
                        var r, s
                        if (
                            i &&
                            (n['on:end'] &&
                                ((s = new D(n)),
                                n['on:end'](t, s),
                                s.isMatchIgnored && (i = !1)),
                            i)
                        ) {
                            for (; n.endsParent && n.parent; ) n = n.parent
                            return n
                        }
                        if (n.endsWithParent) return e(n.parent, t, a)
                    })(m, e, t)
                if (!a) return J
                t = m
                for (
                    m.endScope && m.endScope._wrap
                        ? (d(), E.addKeyword(n, m.endScope._wrap))
                        : m.endScope && m.endScope._multi
                        ? (d(), i(m.endScope, e))
                        : t.skip
                        ? (v += n)
                        : (t.returnEnd || t.excludeEnd || (v += n),
                          d(),
                          t.excludeEnd && (v = n));
                    m.scope && !m.isMultiClass && E.closeNode(),
                        m.skip || m.subLanguage || (w += m.relevance),
                        (m = m.parent) !== a.parent;

                );
                return a.starts && u(a.starts, e), t.returnEnd ? 0 : n.length
            }
            let h = {}
            function n(e, n) {
                var t = n && n[0]
                if (((v += e), null == t)) return d(), 0
                if (
                    'begin' === h.type &&
                    'end' === n.type &&
                    h.index === n.index &&
                    '' === t
                ) {
                    if (((v += s.slice(n.index, n.index + 1)), S)) return 1
                    {
                        const a = new Error(`0 width match regex (${r})`)
                        throw ((a.languageName = r), (a.badRule = h.rule), a)
                    }
                }
                if ('begin' === (h = n).type) return g(n)
                if ('illegal' === n.type && !o) {
                    const i = new Error(
                        'Illegal lexeme "' +
                            t +
                            '" for mode "' +
                            (m.scope || '<unnamed>') +
                            '"'
                    )
                    throw ((i.mode = m), i)
                }
                if ('end' === n.type) {
                    e = b(n)
                    if (e !== J) return e
                }
                if ('illegal' === n.type && '' === t) return 1
                if (1e5 < _ && _ > 3 * n.index)
                    throw new Error(
                        'potential infinite loop, way more iterations than matches'
                    )
                return (v += t), t.length
            }
            const p = I(r)
            if (!p)
                throw (
                    (j(M.replace('{}', r)),
                    new Error('Unknown language: "' + r + '"'))
                )
            var t = Q(p)
            let a = '',
                m = e || t
            const f = {},
                E = new R.__emitter(R)
            {
                const k = []
                for (let e = m; e !== p; e = e.parent)
                    e.scope && k.unshift(e.scope)
                k.forEach((e) => E.openNode(e))
            }
            let v = '',
                w = 0,
                y = 0,
                _ = 0,
                N = !1
            try {
                for (m.matcher.considerAll(); ; ) {
                    _++,
                        N ? (N = !1) : m.matcher.considerAll(),
                        (m.matcher.lastIndex = y)
                    var x = m.matcher.exec(s)
                    if (!x) break
                    var A = n(s.substring(y, x.index), x)
                    y = x.index + A
                }
                return (
                    n(s.substr(y)),
                    E.closeAllNodes(),
                    E.finalize(),
                    (a = E.toHTML()),
                    {
                        language: r,
                        value: a,
                        relevance: w,
                        illegal: !1,
                        _emitter: E,
                        _top: m,
                    }
                )
            } catch (e) {
                if (e.message && e.message.includes('Illegal'))
                    return {
                        language: r,
                        value: C(s),
                        illegal: !0,
                        relevance: 0,
                        _illegalBy: {
                            message: e.message,
                            index: y,
                            context: s.slice(y - 100, y + 100),
                            mode: e.mode,
                            resultSoFar: a,
                        },
                        _emitter: E,
                    }
                if (S)
                    return {
                        language: r,
                        value: C(s),
                        illegal: !1,
                        relevance: 0,
                        errorRaised: e,
                        _emitter: E,
                        _top: m,
                    }
                throw e
            }
        }
        function T(n, e) {
            e = e || R.languages || Object.keys(O)
            var t = (function (e) {
                const n = {
                    value: C(e),
                    illegal: !1,
                    relevance: 0,
                    _top: s,
                    _emitter: new R.__emitter(R),
                }
                return n._emitter.addText(e), n
            })(n)
            const a = e
                .filter(I)
                .filter(d)
                .map((e) => B(e, n, !1))
            a.unshift(t)
            var [e, t] = a.sort((e, n) => {
                if (e.relevance !== n.relevance)
                    return n.relevance - e.relevance
                if (e.language && n.language) {
                    if (I(e.language).supersetOf === n.language) return 1
                    if (I(n.language).supersetOf === e.language) return -1
                }
                return 0
            })
            const i = e
            return (i.secondBest = t), i
        }
        function n(e) {
            var n,
                t,
                a,
                i = (function (e) {
                    let n = e.className + ' '
                    n += e.parentNode ? e.parentNode.className : ''
                    var t,
                        a = R.languageDetectRe.exec(n)
                    return a
                        ? ((t = I(a[1])) ||
                              (x(M.replace('{}', a[1])),
                              x(
                                  'Falling back to no-highlight mode for this block.',
                                  e
                              )),
                          t ? a[1] : 'no-highlight')
                        : n.split(/\s+/).find((e) => o(e) || I(e))
                })(e)
            o(i) ||
                (u('before:highlightElement', { el: e, language: i }),
                !R.ignoreUnescapedHTML &&
                    0 < e.children.length &&
                    (console.warn(
                        'One of your code blocks includes unescaped HTML. This is a potentially serious security risk.'
                    ),
                    console.warn(
                        'https://github.com/highlightjs/highlight.js/issues/2886'
                    ),
                    console.warn(e)),
                (t = e.textContent),
                u('after:highlightElement', {
                    el: e,
                    result: (n = i
                        ? l(t, { language: i, ignoreIllegals: !0 })
                        : T(t)),
                    text: t,
                }),
                (e.innerHTML = n.value),
                (t = e),
                (i = i),
                (a = n.language),
                (i = (i && r[i]) || a),
                t.classList.add('hljs'),
                t.classList.add('language-' + i),
                (e.result = {
                    language: n.language,
                    re: n.relevance,
                    relevance: n.relevance,
                }),
                n.secondBest &&
                    (e.secondBest = {
                        language: n.secondBest.language,
                        relevance: n.secondBest.relevance,
                    }))
        }
        let t = !1
        function e() {
            if ('loading' === document.readyState) t = !0
            else {
                const e = document.querySelectorAll(R.cssSelector)
                e.forEach(n)
            }
        }
        function I(e) {
            return (e = (e || '').toLowerCase()), O[e] || O[r[e]]
        }
        function c(e, { languageName: n }) {
            ;(e = 'string' == typeof e ? [e] : e).forEach((e) => {
                r[e.toLowerCase()] = n
            })
        }
        function d(e) {
            e = I(e)
            return e && !e.disableAutodetect
        }
        function u(e, n) {
            const t = e
            i.forEach(function (e) {
                e[t] && e[t](n)
            })
        }
        'undefined' != typeof window &&
            window.addEventListener &&
            window.addEventListener(
                'DOMContentLoaded',
                function () {
                    t && e()
                },
                !1
            ),
            Object.assign(a, {
                highlight: l,
                highlightAuto: T,
                highlightAll: e,
                highlightElement: n,
                highlightBlock: function (e) {
                    return (
                        A(
                            '10.7.0',
                            'highlightBlock will be removed entirely in v12.0'
                        ),
                        A('10.7.0', 'Please use highlightElement now.'),
                        n(e)
                    )
                },
                configure: function (e) {
                    R = F(R, e)
                },
                initHighlighting: () => {
                    e(),
                        A(
                            '10.6.0',
                            'initHighlighting() deprecated.  Use highlightAll() now.'
                        )
                },
                initHighlightingOnLoad: function () {
                    e(),
                        A(
                            '10.6.0',
                            'initHighlightingOnLoad() deprecated.  Use highlightAll() now.'
                        )
                },
                registerLanguage: function (n, e) {
                    let t = null
                    try {
                        t = e(a)
                    } catch (e) {
                        if (
                            (j(
                                "Language definition for '{}' could not be registered.".replace(
                                    '{}',
                                    n
                                )
                            ),
                            !S)
                        )
                            throw e
                        j(e), (t = s)
                    }
                    t.name || (t.name = n),
                        ((O[n] = t).rawDefinition = e.bind(null, a)),
                        t.aliases && c(t.aliases, { languageName: n })
                },
                unregisterLanguage: function (e) {
                    delete O[e]
                    for (const n of Object.keys(r)) r[n] === e && delete r[n]
                },
                listLanguages: function () {
                    return Object.keys(O)
                },
                getLanguage: I,
                registerAliases: c,
                autoDetection: d,
                inherit: F,
                addPlugin: function (e) {
                    var n
                    ;(n = e)['before:highlightBlock'] &&
                        !n['before:highlightElement'] &&
                        (n['before:highlightElement'] = (e) => {
                            n['before:highlightBlock'](
                                Object.assign({ block: e.el }, e)
                            )
                        }),
                        n['after:highlightBlock'] &&
                            !n['after:highlightElement'] &&
                            (n['after:highlightElement'] = (e) => {
                                n['after:highlightBlock'](
                                    Object.assign({ block: e.el }, e)
                                )
                            }),
                        i.push(e)
                },
            }),
            (a.debugMode = function () {
                S = !1
            }),
            (a.safeMode = function () {
                S = !0
            }),
            (a.versionString = '11.0.0-beta1')
        for (const g in y) 'object' == typeof y[g] && z(y[g])
        return Object.assign(a, y), a
    })({})
    const V = [
            'a',
            'abbr',
            'address',
            'article',
            'aside',
            'audio',
            'b',
            'blockquote',
            'body',
            'button',
            'canvas',
            'caption',
            'cite',
            'code',
            'dd',
            'del',
            'details',
            'dfn',
            'div',
            'dl',
            'dt',
            'em',
            'fieldset',
            'figcaption',
            'figure',
            'footer',
            'form',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'header',
            'hgroup',
            'html',
            'i',
            'iframe',
            'img',
            'input',
            'ins',
            'kbd',
            'label',
            'legend',
            'li',
            'main',
            'mark',
            'menu',
            'nav',
            'object',
            'ol',
            'p',
            'q',
            'quote',
            'samp',
            'section',
            'span',
            'strong',
            'summary',
            'sup',
            'table',
            'tbody',
            'td',
            'textarea',
            'tfoot',
            'th',
            'thead',
            'time',
            'tr',
            'ul',
            'var',
            'video',
        ],
        Y = [
            'any-hover',
            'any-pointer',
            'aspect-ratio',
            'color',
            'color-gamut',
            'color-index',
            'device-aspect-ratio',
            'device-height',
            'device-width',
            'display-mode',
            'forced-colors',
            'grid',
            'height',
            'hover',
            'inverted-colors',
            'monochrome',
            'orientation',
            'overflow-block',
            'overflow-inline',
            'pointer',
            'prefers-color-scheme',
            'prefers-contrast',
            'prefers-reduced-motion',
            'prefers-reduced-transparency',
            'resolution',
            'scan',
            'scripting',
            'update',
            'width',
            'min-width',
            'max-width',
            'min-height',
            'max-height',
        ],
        ee = [
            'active',
            'any-link',
            'blank',
            'checked',
            'current',
            'default',
            'defined',
            'dir',
            'disabled',
            'drop',
            'empty',
            'enabled',
            'first',
            'first-child',
            'first-of-type',
            'fullscreen',
            'future',
            'focus',
            'focus-visible',
            'focus-within',
            'has',
            'host',
            'host-context',
            'hover',
            'indeterminate',
            'in-range',
            'invalid',
            'is',
            'lang',
            'last-child',
            'last-of-type',
            'left',
            'link',
            'local-link',
            'not',
            'nth-child',
            'nth-col',
            'nth-last-child',
            'nth-last-col',
            'nth-last-of-type',
            'nth-of-type',
            'only-child',
            'only-of-type',
            'optional',
            'out-of-range',
            'past',
            'placeholder-shown',
            'read-only',
            'read-write',
            'required',
            'right',
            'root',
            'scope',
            'target',
            'target-within',
            'user-invalid',
            'valid',
            'visited',
            'where',
        ],
        ne = [
            'after',
            'backdrop',
            'before',
            'cue',
            'cue-region',
            'first-letter',
            'first-line',
            'grammar-error',
            'marker',
            'part',
            'placeholder',
            'selection',
            'slotted',
            'spelling-error',
        ],
        te = [
            'align-content',
            'align-items',
            'align-self',
            'animation',
            'animation-delay',
            'animation-direction',
            'animation-duration',
            'animation-fill-mode',
            'animation-iteration-count',
            'animation-name',
            'animation-play-state',
            'animation-timing-function',
            'auto',
            'backface-visibility',
            'background',
            'background-attachment',
            'background-clip',
            'background-color',
            'background-image',
            'background-origin',
            'background-position',
            'background-repeat',
            'background-size',
            'border',
            'border-bottom',
            'border-bottom-color',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'border-bottom-style',
            'border-bottom-width',
            'border-collapse',
            'border-color',
            'border-image',
            'border-image-outset',
            'border-image-repeat',
            'border-image-slice',
            'border-image-source',
            'border-image-width',
            'border-left',
            'border-left-color',
            'border-left-style',
            'border-left-width',
            'border-radius',
            'border-right',
            'border-right-color',
            'border-right-style',
            'border-right-width',
            'border-spacing',
            'border-style',
            'border-top',
            'border-top-color',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-top-style',
            'border-top-width',
            'border-width',
            'bottom',
            'box-decoration-break',
            'box-shadow',
            'box-sizing',
            'break-after',
            'break-before',
            'break-inside',
            'caption-side',
            'clear',
            'clip',
            'clip-path',
            'color',
            'column-count',
            'column-fill',
            'column-gap',
            'column-rule',
            'column-rule-color',
            'column-rule-style',
            'column-rule-width',
            'column-span',
            'column-width',
            'columns',
            'content',
            'counter-increment',
            'counter-reset',
            'cursor',
            'direction',
            'display',
            'empty-cells',
            'filter',
            'flex',
            'flex-basis',
            'flex-direction',
            'flex-flow',
            'flex-grow',
            'flex-shrink',
            'flex-wrap',
            'float',
            'font',
            'font-display',
            'font-family',
            'font-feature-settings',
            'font-kerning',
            'font-language-override',
            'font-size',
            'font-size-adjust',
            'font-smoothing',
            'font-stretch',
            'font-style',
            'font-variant',
            'font-variant-ligatures',
            'font-variation-settings',
            'font-weight',
            'height',
            'hyphens',
            'icon',
            'image-orientation',
            'image-rendering',
            'image-resolution',
            'ime-mode',
            'inherit',
            'initial',
            'justify-content',
            'left',
            'letter-spacing',
            'line-height',
            'list-style',
            'list-style-image',
            'list-style-position',
            'list-style-type',
            'margin',
            'margin-bottom',
            'margin-left',
            'margin-right',
            'margin-top',
            'marks',
            'mask',
            'max-height',
            'max-width',
            'min-height',
            'min-width',
            'nav-down',
            'nav-index',
            'nav-left',
            'nav-right',
            'nav-up',
            'none',
            'normal',
            'object-fit',
            'object-position',
            'opacity',
            'order',
            'orphans',
            'outline',
            'outline-color',
            'outline-offset',
            'outline-style',
            'outline-width',
            'overflow',
            'overflow-wrap',
            'overflow-x',
            'overflow-y',
            'padding',
            'padding-bottom',
            'padding-left',
            'padding-right',
            'padding-top',
            'page-break-after',
            'page-break-before',
            'page-break-inside',
            'perspective',
            'perspective-origin',
            'pointer-events',
            'position',
            'quotes',
            'resize',
            'right',
            'src',
            'tab-size',
            'table-layout',
            'text-align',
            'text-align-last',
            'text-decoration',
            'text-decoration-color',
            'text-decoration-line',
            'text-decoration-style',
            'text-indent',
            'text-overflow',
            'text-rendering',
            'text-shadow',
            'text-transform',
            'text-underline-position',
            'top',
            'transform',
            'transform-origin',
            'transform-style',
            'transition',
            'transition-delay',
            'transition-duration',
            'transition-property',
            'transition-timing-function',
            'unicode-bidi',
            'vertical-align',
            'visibility',
            'white-space',
            'widows',
            'width',
            'word-break',
            'word-spacing',
            'word-wrap',
            'z-index',
        ].reverse()
    ee.concat(ne)
    const R = '[A-Za-z$_][0-9A-Za-z$_]*',
        ae = [
            'as',
            'in',
            'of',
            'if',
            'for',
            'while',
            'finally',
            'var',
            'new',
            'function',
            'do',
            'return',
            'void',
            'else',
            'break',
            'catch',
            'instanceof',
            'with',
            'throw',
            'case',
            'default',
            'try',
            'switch',
            'continue',
            'typeof',
            'delete',
            'let',
            'yield',
            'const',
            'class',
            'debugger',
            'async',
            'await',
            'static',
            'import',
            'from',
            'export',
            'extends',
        ],
        ie = ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'],
        re = [
            'Intl',
            'DataView',
            'Number',
            'Math',
            'Date',
            'String',
            'RegExp',
            'Object',
            'Function',
            'Boolean',
            'Error',
            'Symbol',
            'Set',
            'Map',
            'WeakSet',
            'WeakMap',
            'Proxy',
            'Reflect',
            'JSON',
            'Promise',
            'Float64Array',
            'Int16Array',
            'Int32Array',
            'Int8Array',
            'Uint16Array',
            'Uint32Array',
            'Float32Array',
            'Array',
            'Uint8Array',
            'Uint8ClampedArray',
            'ArrayBuffer',
            'BigInt64Array',
            'BigUint64Array',
            'BigInt',
        ],
        se = [
            'EvalError',
            'InternalError',
            'RangeError',
            'ReferenceError',
            'SyntaxError',
            'TypeError',
            'URIError',
        ],
        oe = [
            'setInterval',
            'setTimeout',
            'clearInterval',
            'clearTimeout',
            'require',
            'exports',
            'eval',
            'isFinite',
            'isNaN',
            'parseFloat',
            'parseInt',
            'decodeURI',
            'decodeURIComponent',
            'encodeURI',
            'encodeURIComponent',
            'escape',
            'unescape',
        ],
        le = [
            'arguments',
            'this',
            'super',
            'console',
            'window',
            'document',
            'localStorage',
            'module',
            'global',
        ],
        ce = [].concat(oe, re, se)
    function de(e) {
        var n = R
        const t = '<>',
            a = '</>',
            i = /<[A-Za-z0-9\\._:-]+/,
            r = /\/[A-Za-z0-9\\._:-]+>|\/>/,
            s = (e, n) => {
                var t = e[0].length + e.index,
                    a = e.input[t]
                '<' === a
                    ? n.ignoreMatch()
                    : '>' === a &&
                      (([a, e] = [e, { after: t }['after']]),
                      (t = '</' + a[0].slice(1)),
                      -1 === a.input.indexOf(t, e) && n.ignoreMatch())
            }
        var o = {
                $pattern: R,
                keyword: ae,
                literal: ie,
                built_in: ce,
                'variable.language': le,
            },
            l = '[0-9](_?[0-9])*',
            c = `\\.(${l})`,
            d = '0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*',
            l = {
                className: 'number',
                variants: [
                    {
                        begin:
                            `(\\b(${d})((${c})|\\.)?|(${c}))` +
                            `[eE][+-]?(${l})\\b`,
                    },
                    { begin: `\\b(${d})\\b((${c})\\b|\\.)?|(${c})\\b` },
                    { begin: '\\b(0|[1-9](_?[0-9])*)n\\b' },
                    { begin: '\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b' },
                    { begin: '\\b0[bB][0-1](_?[0-1])*n?\\b' },
                    { begin: '\\b0[oO][0-7](_?[0-7])*n?\\b' },
                    { begin: '\\b0[0-7]+n?\\b' },
                ],
                relevance: 0,
            }
        const u = {
            className: 'subst',
            begin: '\\$\\{',
            end: '\\}',
            keywords: o,
            contains: [],
        }
        var d = {
                begin: 'html`',
                end: '',
                starts: {
                    end: '`',
                    returnEnd: !1,
                    contains: [e.BACKSLASH_ESCAPE, u],
                    subLanguage: 'xml',
                },
            },
            c = {
                begin: 'css`',
                end: '',
                starts: {
                    end: '`',
                    returnEnd: !1,
                    contains: [e.BACKSLASH_ESCAPE, u],
                    subLanguage: 'css',
                },
            },
            g = {
                className: 'string',
                begin: '`',
                end: '`',
                contains: [e.BACKSLASH_ESCAPE, u],
            },
            b = {
                className: 'comment',
                variants: [
                    e.COMMENT(/\/\*\*(?!\/)/, '\\*/', {
                        relevance: 0,
                        contains: [
                            {
                                begin: '(?=@[A-Za-z]+)',
                                relevance: 0,
                                contains: [
                                    {
                                        className: 'doctag',
                                        begin: '@[A-Za-z]+',
                                    },
                                    {
                                        className: 'type',
                                        begin: '\\{',
                                        end: '\\}',
                                        excludeEnd: !0,
                                        excludeBegin: !0,
                                        relevance: 0,
                                    },
                                    {
                                        className: 'variable',
                                        begin: n + '(?=\\s*(-)|$)',
                                        endsParent: !0,
                                        relevance: 0,
                                    },
                                    { begin: /(?=[^\n])\s/, relevance: 0 },
                                ],
                            },
                        ],
                    }),
                    e.C_BLOCK_COMMENT_MODE,
                    e.C_LINE_COMMENT_MODE,
                ],
            }
        const h = [
                e.APOS_STRING_MODE,
                e.QUOTE_STRING_MODE,
                d,
                c,
                g,
                l,
                e.REGEXP_MODE,
            ],
            p =
                ((u.contains = h.concat({
                    begin: /\{/,
                    end: /\}/,
                    keywords: o,
                    contains: ['self'].concat(h),
                })),
                [].concat(b, u.contains))
        var m = p.concat([
                {
                    begin: /\(/,
                    end: /\)/,
                    keywords: o,
                    contains: ['self'].concat(p),
                },
            ]),
            f = {
                className: 'params',
                begin: /\(/,
                end: /\)/,
                excludeBegin: !0,
                excludeEnd: !0,
                keywords: o,
                contains: m,
            },
            E = {
                variants: [
                    {
                        match: [/class/, /\s+/, n],
                        scope: { 1: 'keyword', 3: 'title.class' },
                    },
                    {
                        match: [/extends/, /\s+/, O(n, '(', O(/\./, n), ')*')],
                        scope: { 1: 'keyword', 3: 'title.class.inherited' },
                    },
                ],
            },
            v = {
                relevance: 0,
                match: /\b[A-Z][a-z]+([A-Z][a-z]+)*/,
                className: 'title.class',
                keywords: { _: [...re, ...se] },
            },
            w = {
                variants: [
                    { match: [/function/, /\s+/, n, /(?=\s*\()/] },
                    { match: [/function/, /\s*(?=\()/] },
                ],
                className: { 1: 'keyword', 3: 'title.function' },
                label: 'func.def',
                contains: [f],
                illegal: /%/,
            }
        var y = {
                match: O(
                    /\b/,
                    O('(?!', [...oe, 'super'].join('|'), ')'),
                    n,
                    k(/\(/)
                ),
                className: 'title.function',
                relevance: 0,
            },
            _ = {
                begin: O(/\./, k(O(n, /(?![0-9A-Za-z$_(])/))),
                end: n,
                excludeBegin: !0,
                keywords: 'prototype',
                className: 'property',
                relevance: 0,
            },
            N = {
                match: [/get|set/, /\s+/, n, /(?=\()/],
                className: { 1: 'keyword', 3: 'title.function' },
                contains: [{ begin: /\(\)/ }, f],
            },
            x =
                '(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|' +
                e.UNDERSCORE_IDENT_RE +
                ')\\s*=>',
            A = {
                match: [/const|var|let/, /\s+/, n, /\s*/, /=\s*/, k(x)],
                className: { 1: 'keyword', 3: 'title.function' },
                contains: [f],
            }
        return {
            name: 'Javascript',
            aliases: ['js', 'jsx', 'mjs', 'cjs'],
            keywords: o,
            exports: { PARAMS_CONTAINS: m },
            illegal: /#(?![$_A-z])/,
            contains: [
                e.SHEBANG({ label: 'shebang', binary: 'node', relevance: 5 }),
                {
                    label: 'use_strict',
                    className: 'meta',
                    relevance: 10,
                    begin: /^\s*['"]use (strict|asm)['"]/,
                },
                e.APOS_STRING_MODE,
                e.QUOTE_STRING_MODE,
                d,
                c,
                g,
                b,
                l,
                v,
                { className: 'attr', begin: n + k(':'), relevance: 0 },
                A,
                {
                    begin:
                        '(' +
                        e.RE_STARTERS_RE +
                        '|\\b(case|return|throw)\\b)\\s*',
                    keywords: 'return throw case',
                    relevance: 0,
                    contains: [
                        b,
                        e.REGEXP_MODE,
                        {
                            className: 'function',
                            begin: x,
                            returnBegin: !0,
                            end: '\\s*=>',
                            contains: [
                                {
                                    className: 'params',
                                    variants: [
                                        {
                                            begin: e.UNDERSCORE_IDENT_RE,
                                            relevance: 0,
                                        },
                                        {
                                            className: null,
                                            begin: /\(\s*\)/,
                                            skip: !0,
                                        },
                                        {
                                            begin: /\(/,
                                            end: /\)/,
                                            excludeBegin: !0,
                                            excludeEnd: !0,
                                            keywords: o,
                                            contains: m,
                                        },
                                    ],
                                },
                            ],
                        },
                        { begin: /,/, relevance: 0 },
                        { match: /\s+/, relevance: 0 },
                        {
                            variants: [
                                { begin: t, end: a },
                                { begin: i, 'on:begin': s, end: r },
                            ],
                            subLanguage: 'xml',
                            contains: [
                                {
                                    begin: i,
                                    end: r,
                                    skip: !0,
                                    contains: ['self'],
                                },
                            ],
                        },
                    ],
                },
                w,
                { beginKeywords: 'while if switch catch for' },
                {
                    begin:
                        '\\b(?!function)' +
                        e.UNDERSCORE_IDENT_RE +
                        '\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{',
                    returnBegin: !0,
                    label: 'func.def',
                    contains: [
                        f,
                        e.inherit(e.TITLE_MODE, {
                            begin: n,
                            className: 'title.function',
                        }),
                    ],
                },
                { match: /\.\.\./, relevance: 0 },
                _,
                { match: '\\$' + n, relevance: 0 },
                {
                    match: [/\bconstructor(?=\s*\()/],
                    className: { 1: 'title.function' },
                    contains: [f],
                },
                y,
                {
                    relevance: 0,
                    match: /\b[A-Z][A-Z_]+\b/,
                    className: 'variable.constant',
                },
                E,
                N,
                { match: /\$[(.]/ },
            ],
        }
    }
    function ue(e) {
        var n = {
            IMPORTANT: { scope: 'meta', begin: '!important' },
            HEXCOLOR: {
                scope: 'number',
                begin: '#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})',
            },
            ATTRIBUTE_SELECTOR_MODE: {
                scope: 'selector-attr',
                begin: /\[/,
                end: /\]/,
                illegal: '$',
                contains: [e.APOS_STRING_MODE, e.QUOTE_STRING_MODE],
            },
            CSS_NUMBER_MODE: {
                scope: 'number',
                begin:
                    e.NUMBER_RE +
                    '(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?',
                relevance: 0,
            },
        }
        const t = ne,
            a = ee
        var i = '@[a-z-]+',
            r = {
                className: 'variable',
                begin: '(\\$[a-zA-Z-][a-zA-Z0-9_-]*)\\b',
            }
        return {
            name: 'SCSS',
            case_insensitive: !0,
            illegal: "[=/|']",
            contains: [
                e.C_LINE_COMMENT_MODE,
                e.C_BLOCK_COMMENT_MODE,
                {
                    className: 'selector-id',
                    begin: '#[A-Za-z0-9_-]+',
                    relevance: 0,
                },
                {
                    className: 'selector-class',
                    begin: '\\.[A-Za-z0-9_-]+',
                    relevance: 0,
                },
                n.ATTRIBUTE_SELECTOR_MODE,
                {
                    className: 'selector-tag',
                    begin: '\\b(' + V.join('|') + ')\\b',
                    relevance: 0,
                },
                {
                    className: 'selector-pseudo',
                    begin: ':(' + a.join('|') + ')',
                },
                {
                    className: 'selector-pseudo',
                    begin: '::(' + t.join('|') + ')',
                },
                r,
                { begin: /\(/, end: /\)/, contains: [n.CSS_NUMBER_MODE] },
                {
                    className: 'attribute',
                    begin: '\\b(' + te.join('|') + ')\\b',
                },
                {
                    begin: '\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b',
                },
                {
                    begin: ':',
                    end: ';',
                    contains: [
                        r,
                        n.HEXCOLOR,
                        n.CSS_NUMBER_MODE,
                        e.QUOTE_STRING_MODE,
                        e.APOS_STRING_MODE,
                        n.IMPORTANT,
                    ],
                },
                {
                    begin: '@(page|font-face)',
                    keywords: { $pattern: i, keyword: '@page @font-face' },
                },
                {
                    begin: '@',
                    end: '[{;]',
                    returnBegin: !0,
                    keywords: {
                        $pattern: /[a-z-]+/,
                        keyword: 'and or not only',
                        attribute: Y.join(' '),
                    },
                    contains: [
                        { begin: i, className: 'keyword' },
                        { begin: /[a-z-]+(?=:)/, className: 'attribute' },
                        r,
                        e.QUOTE_STRING_MODE,
                        e.APOS_STRING_MODE,
                        n.HEXCOLOR,
                        n.CSS_NUMBER_MODE,
                    ],
                },
            ],
        }
    }
    ;(f = (e) => O(/\b/, e, /\w$/.test(e) ? /\b/ : /\B/)),
        ['Protocol', 'Type'].map(f),
        ['init', 'self'].map(f),
        (E = d(
            /[/=\-+!*%<>&|^~?]/,
            /[\u00A1-\u00A7]/,
            /[\u00A9\u00AB]/,
            /[\u00AC\u00AE]/,
            /[\u00B0\u00B1]/,
            /[\u00B6\u00BB\u00BF\u00D7\u00F7]/,
            /[\u2016-\u2017]/,
            /[\u2020-\u2027]/,
            /[\u2030-\u203E]/,
            /[\u2041-\u2053]/,
            /[\u2055-\u205E]/,
            /[\u2190-\u23FF]/,
            /[\u2500-\u2775]/,
            /[\u2794-\u2BFF]/,
            /[\u2E00-\u2E7F]/,
            /[\u3001-\u3003]/,
            /[\u3008-\u3020]/,
            /[\u3030]/
        )),
        O(
            E,
            d(
                E,
                /[\u0300-\u036F]/,
                /[\u1DC0-\u1DFF]/,
                /[\u20D0-\u20FF]/,
                /[\uFE00-\uFE0F]/,
                /[\uFE20-\uFE2F]/
            ),
            '*'
        ),
        (v = d(
            /[a-zA-Z_]/,
            /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/,
            /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/,
            /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/,
            /[\u1E00-\u1FFF]/,
            /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/,
            /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/,
            /[\u2C00-\u2DFF\u2E80-\u2FFF]/,
            /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/,
            /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/,
            /[\uFE47-\uFEFE\uFF00-\uFFFD]/
        )),
        (w = d(
            v,
            /\d/,
            /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
        )),
        (o = O(v, w, '*'))
    O(/[A-Z]/, w, '*'),
        O(/convention\(/, d('swift', 'block', 'c'), /\)/),
        O(/objc\(/, o, /\)/)
    var ge = Object.freeze({
        __proto__: null,
        grmr_bash: function (e) {
            var n = {},
                t = {
                    begin: /\$\{/,
                    end: /\}/,
                    contains: ['self', { begin: /:-/, contains: [n] }],
                }
            Object.assign(n, {
                className: 'variable',
                variants: [
                    { begin: O(/\$[\w\d#@][\w\d_]*/, '(?![\\w\\d])(?![$])') },
                    t,
                ],
            })
            const a = {
                className: 'subst',
                begin: /\$\(/,
                end: /\)/,
                contains: [e.BACKSLASH_ESCAPE],
            }
            var t = {
                    begin: /<<-?\s*(?=\w+)/,
                    starts: {
                        contains: [
                            e.END_SAME_AS_BEGIN({
                                begin: /(\w+)/,
                                end: /(\w+)/,
                                className: 'string',
                            }),
                        ],
                    },
                },
                i = {
                    className: 'string',
                    begin: /"/,
                    end: /"/,
                    contains: [e.BACKSLASH_ESCAPE, n, a],
                },
                r =
                    (a.contains.push(i),
                    {
                        begin: /\$\(\(/,
                        end: /\)\)/,
                        contains: [
                            { begin: /\d+#[0-9a-f]+/, className: 'number' },
                            e.NUMBER_MODE,
                            n,
                        ],
                    }),
                s = e.SHEBANG({
                    binary: `(${[
                        'fish',
                        'bash',
                        'zsh',
                        'sh',
                        'csh',
                        'ksh',
                        'tcsh',
                        'dash',
                        'scsh',
                    ].join('|')})`,
                    relevance: 10,
                }),
                o = {
                    className: 'function',
                    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
                    returnBegin: !0,
                    contains: [
                        e.inherit(e.TITLE_MODE, { begin: /\w[\w\d_]*/ }),
                    ],
                    relevance: 0,
                }
            return {
                name: 'Bash',
                aliases: ['sh'],
                keywords: {
                    $pattern: /\b[a-z._-]+\b/,
                    keyword: [
                        'if',
                        'then',
                        'else',
                        'elif',
                        'fi',
                        'for',
                        'while',
                        'in',
                        'do',
                        'done',
                        'case',
                        'esac',
                        'function',
                    ],
                    literal: ['true', 'false'],
                    built_in:
                        'break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp',
                },
                contains: [
                    s,
                    e.SHEBANG(),
                    o,
                    r,
                    e.HASH_COMMENT_MODE,
                    t,
                    i,
                    { className: '', begin: /\\"/ },
                    { className: 'string', begin: /'/, end: /'/ },
                    n,
                ],
            }
        },
        grmr_scss: ue,
        grmr_css: ue,
        grmr_javascript: de,
        grmr_json: function (e) {
            var n = { beginKeywords: ['true', 'false', 'null'].join(' ') }
            return {
                name: 'JSON',
                contains: [
                    {
                        className: 'attr',
                        begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
                        relevance: 1.01,
                    },
                    {
                        match: /[{}[\],:]/,
                        className: 'punctuation',
                        relevance: 0,
                    },
                    e.QUOTE_STRING_MODE,
                    n,
                    e.C_NUMBER_MODE,
                    e.C_LINE_COMMENT_MODE,
                    e.C_BLOCK_COMMENT_MODE,
                ],
                illegal: '\\S',
            }
        },
        grmr_xml: function (e) {
            var n = O(
                    /[A-Z_]/,
                    O('(?:', /[A-Z0-9_.-]*:/, ')?'),
                    /[A-Z0-9_.-]*/
                ),
                t = {
                    className: 'symbol',
                    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/,
                },
                a = {
                    begin: /\s/,
                    contains: [
                        {
                            className: 'keyword',
                            begin: /#?[a-z_][a-z1-9_-]+/,
                            illegal: /\n/,
                        },
                    ],
                },
                i = e.inherit(a, { begin: /\(/, end: /\)/ }),
                r = e.inherit(e.APOS_STRING_MODE, { className: 'string' }),
                s = e.inherit(e.QUOTE_STRING_MODE, { className: 'string' }),
                o = {
                    endsWithParent: !0,
                    illegal: /</,
                    relevance: 0,
                    contains: [
                        {
                            className: 'attr',
                            begin: /[A-Za-z0-9._:-]+/,
                            relevance: 0,
                        },
                        {
                            begin: /=\s*/,
                            relevance: 0,
                            contains: [
                                {
                                    className: 'string',
                                    endsParent: !0,
                                    variants: [
                                        { begin: /"/, end: /"/, contains: [t] },
                                        { begin: /'/, end: /'/, contains: [t] },
                                        { begin: /[^\s"'=<>`]+/ },
                                    ],
                                },
                            ],
                        },
                    ],
                }
            return {
                name: 'HTML, XML',
                aliases: [
                    'html',
                    'xhtml',
                    'rss',
                    'atom',
                    'xjb',
                    'xsd',
                    'xsl',
                    'plist',
                    'wsf',
                    'svg',
                ],
                case_insensitive: !0,
                contains: [
                    {
                        className: 'meta',
                        begin: /<![a-z]/,
                        end: />/,
                        relevance: 10,
                        contains: [
                            a,
                            s,
                            r,
                            i,
                            {
                                begin: /\[/,
                                end: /\]/,
                                contains: [
                                    {
                                        className: 'meta',
                                        begin: /<![a-z]/,
                                        end: />/,
                                        contains: [a, i, s, r],
                                    },
                                ],
                            },
                        ],
                    },
                    e.COMMENT(/<!--/, /-->/, { relevance: 10 }),
                    { begin: /<!\[CDATA\[/, end: /\]\]>/, relevance: 10 },
                    t,
                    {
                        className: 'meta',
                        begin: /<\?xml/,
                        end: /\?>/,
                        relevance: 10,
                    },
                    {
                        className: 'tag',
                        begin: /<style(?=\s|>)/,
                        end: />/,
                        keywords: { name: 'style' },
                        contains: [o],
                        starts: {
                            end: /<\/style>/,
                            returnEnd: !0,
                            subLanguage: ['css', 'xml'],
                        },
                    },
                    {
                        className: 'tag',
                        begin: /<script(?=\s|>)/,
                        end: />/,
                        keywords: { name: 'script' },
                        contains: [o],
                        starts: {
                            end: /<\/script>/,
                            returnEnd: !0,
                            subLanguage: ['javascript', 'handlebars', 'xml'],
                        },
                    },
                    { className: 'tag', begin: /<>|<\/>/ },
                    {
                        className: 'tag',
                        begin: O(/</, k(O(n, d(/\/>/, />/, /\s/)))),
                        end: /\/?>/,
                        contains: [
                            {
                                className: 'name',
                                begin: n,
                                relevance: 0,
                                starts: o,
                            },
                        ],
                    },
                    {
                        className: 'tag',
                        begin: O(/<\//, k(O(n, />/))),
                        contains: [
                            { className: 'name', begin: n, relevance: 0 },
                            { begin: />/, relevance: 0, endsParent: !0 },
                        ],
                    },
                ],
            }
        },
        grmr_markdown: function (e) {
            var n = {
                    begin: /<\/?[A-Za-z_]/,
                    end: '>',
                    subLanguage: 'xml',
                    relevance: 0,
                },
                t = {
                    variants: [
                        { begin: /\[.+?\]\[.*?\]/, relevance: 0 },
                        {
                            begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
                            relevance: 2,
                        },
                        {
                            begin: O(
                                /\[.+?\]\(/,
                                /[A-Za-z][A-Za-z0-9+.-]*/,
                                /:\/\/.*?\)/
                            ),
                            relevance: 2,
                        },
                        { begin: /\[.+?\]\([./?&#].*?\)/, relevance: 1 },
                        { begin: /\[.+?\]\(.*?\)/, relevance: 0 },
                    ],
                    returnBegin: !0,
                    contains: [
                        {
                            className: 'string',
                            relevance: 0,
                            begin: '\\[',
                            end: '\\]',
                            excludeBegin: !0,
                            returnEnd: !0,
                        },
                        {
                            className: 'link',
                            relevance: 0,
                            begin: '\\]\\(',
                            end: '\\)',
                            excludeBegin: !0,
                            excludeEnd: !0,
                        },
                        {
                            className: 'symbol',
                            relevance: 0,
                            begin: '\\]\\[',
                            end: '\\]',
                            excludeBegin: !0,
                            excludeEnd: !0,
                        },
                    ],
                }
            const a = {
                    className: 'strong',
                    contains: [],
                    variants: [
                        { begin: /_{2}/, end: /_{2}/ },
                        { begin: /\*{2}/, end: /\*{2}/ },
                    ],
                },
                i = {
                    className: 'emphasis',
                    contains: [],
                    variants: [
                        { begin: /\*(?!\*)/, end: /\*/ },
                        { begin: /_(?!_)/, end: /_/, relevance: 0 },
                    ],
                }
            a.contains.push(i), i.contains.push(a)
            let r = [n, t]
            ;(a.contains = a.contains.concat(r)),
                (i.contains = i.contains.concat(r))
            var s = {
                    className: 'section',
                    variants: [
                        {
                            begin: '^#{1,6}',
                            end: '$',
                            contains: (r = r.concat(a, i)),
                        },
                        {
                            begin: '(?=^.+?\\n[=-]{2,}$)',
                            contains: [
                                { begin: '^[=-]*$' },
                                { begin: '^', end: '\\n', contains: r },
                            ],
                        },
                    ],
                },
                o = {
                    className: 'quote',
                    begin: '^>\\s+',
                    contains: r,
                    end: '$',
                }
            return {
                name: 'Markdown',
                aliases: ['md', 'mkdown', 'mkd'],
                contains: [
                    s,
                    n,
                    {
                        className: 'bullet',
                        begin: '^[ \t]*([*+-]|(\\d+\\.))(?=\\s+)',
                        end: '\\s+',
                        excludeEnd: !0,
                    },
                    a,
                    i,
                    o,
                    {
                        className: 'code',
                        variants: [
                            { begin: '(`{3,})[^`](.|\\n)*?\\1`*[ ]*' },
                            { begin: '(~{3,})[^~](.|\\n)*?\\1~*[ ]*' },
                            { begin: '```', end: '```+[ ]*$' },
                            { begin: '~~~', end: '~~~+[ ]*$' },
                            { begin: '`.+?`' },
                            {
                                begin: '(?=^( {4}|\\t))',
                                contains: [
                                    { begin: '^( {4}|\\t)', end: '(\\n)$' },
                                ],
                                relevance: 0,
                            },
                        ],
                    },
                    { begin: '^[-\\*]{3,}', end: '$' },
                    t,
                    {
                        begin: /^\[[^\n]+\]:/,
                        returnBegin: !0,
                        contains: [
                            {
                                className: 'symbol',
                                begin: /\[/,
                                end: /\]/,
                                excludeBegin: !0,
                                excludeEnd: !0,
                            },
                            {
                                className: 'link',
                                begin: /:\s*/,
                                end: /$/,
                                excludeBegin: !0,
                            },
                        ],
                    },
                ],
            }
        },
        grmr_plaintext: function (e) {
            return {
                name: 'Plain text',
                aliases: ['text', 'txt'],
                disableAutodetect: !0,
            }
        },
        grmr_shell: function (e) {
            return {
                name: 'Shell Session',
                aliases: ['console', 'shellsession'],
                contains: [
                    {
                        className: 'meta',
                        begin: /^\s{0,3}[/~\w\d[\]()@-]*[>%$#][ ]?/,
                        starts: { end: /[^\\](?=\s*$)/, subLanguage: 'bash' },
                    },
                ],
            }
        },
        grmr_typescript: function (e) {
            R
            var n = {
                    $pattern: R,
                    keyword: ae.concat([
                        'type',
                        'namespace',
                        'typedef',
                        'interface',
                        'public',
                        'private',
                        'protected',
                        'implements',
                        'declare',
                        'abstract',
                        'readonly',
                    ]),
                    literal: ie,
                    built_in: ce.concat([
                        'any',
                        'void',
                        'number',
                        'boolean',
                        'string',
                        'object',
                        'never',
                        'enum',
                    ]),
                    'variable.language': le,
                },
                t = { className: 'meta', begin: '@[A-Za-z$_][0-9A-Za-z$_]*' },
                a = (e, n, t) => {
                    var a = e.contains.findIndex((e) => e.label === n)
                    if (-1 === a)
                        throw new Error('can not find mode to replace')
                    e.contains.splice(a, 1, t)
                }
            const i = de(e),
                r =
                    (Object.assign(i.keywords, n),
                    i.exports.PARAMS_CONTAINS.push(t),
                    (i.contains = i.contains.concat([
                        t,
                        {
                            beginKeywords: 'namespace',
                            end: /\{/,
                            excludeEnd: !0,
                        },
                        {
                            beginKeywords: 'interface',
                            end: /\{/,
                            excludeEnd: !0,
                            keywords: 'interface extends',
                        },
                    ])),
                    a(i, 'shebang', e.SHEBANG()),
                    a(i, 'use_strict', {
                        className: 'meta',
                        relevance: 10,
                        begin: /^\s*['"]use strict['"]/,
                    }),
                    i.contains.find((e) => 'func.def' === e.label))
            return (
                (r.relevance = 0),
                Object.assign(i, {
                    name: 'TypeScript',
                    aliases: ['ts', 'tsx'],
                }),
                i
            )
        },
        grmr_yaml: function (e) {
            var n = 'true false yes no null',
                t = "[\\w#;/?:@&=+$,.~*'()[\\]]+",
                a = {
                    className: 'string',
                    relevance: 0,
                    variants: [
                        { begin: /'/, end: /'/ },
                        { begin: /"/, end: /"/ },
                        { begin: /\S+/ },
                    ],
                    contains: [
                        e.BACKSLASH_ESCAPE,
                        {
                            className: 'template-variable',
                            variants: [
                                { begin: /\{\{/, end: /\}\}/ },
                                { begin: /%\{/, end: /\}/ },
                            ],
                        },
                    ],
                },
                i = e.inherit(a, {
                    variants: [
                        { begin: /'/, end: /'/ },
                        { begin: /"/, end: /"/ },
                        { begin: /[^\s,{}[\]]+/ },
                    ],
                })
            const r = {
                end: ',',
                endsWithParent: !0,
                excludeEnd: !0,
                keywords: n,
                relevance: 0,
            }
            var s = {
                    begin: /\{/,
                    end: /\}/,
                    contains: [r],
                    illegal: '\\n',
                    relevance: 0,
                },
                o = {
                    begin: '\\[',
                    end: '\\]',
                    contains: [r],
                    illegal: '\\n',
                    relevance: 0,
                }
            const l = [
                ...(t = [
                    {
                        className: 'attr',
                        variants: [
                            { begin: '\\w[\\w :\\/.-]*:(?=[ \t]|$)' },
                            { begin: '"\\w[\\w :\\/.-]*":(?=[ \t]|$)' },
                            { begin: "'\\w[\\w :\\/.-]*':(?=[ \t]|$)" },
                        ],
                    },
                    { className: 'meta', begin: '^---\\s*$', relevance: 10 },
                    {
                        className: 'string',
                        begin: '[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*',
                    },
                    {
                        begin: '<%[%=-]?',
                        end: '[%-]?%>',
                        subLanguage: 'ruby',
                        excludeBegin: !0,
                        excludeEnd: !0,
                        relevance: 0,
                    },
                    { className: 'type', begin: '!\\w+!' + t },
                    { className: 'type', begin: '!<' + t + '>' },
                    { className: 'type', begin: '!' + t },
                    { className: 'type', begin: '!!' + t },
                    {
                        className: 'meta',
                        begin: '&' + e.UNDERSCORE_IDENT_RE + '$',
                    },
                    {
                        className: 'meta',
                        begin: '\\*' + e.UNDERSCORE_IDENT_RE + '$',
                    },
                    { className: 'bullet', begin: '-(?=[ ]|$)', relevance: 0 },
                    e.HASH_COMMENT_MODE,
                    { beginKeywords: n, keywords: { literal: n } },
                    {
                        className: 'number',
                        begin: '\\b[0-9]{4}(-[0-9][0-9]){0,2}([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?(\\.[0-9]*)?([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?\\b',
                    },
                    {
                        className: 'number',
                        begin: e.C_NUMBER_RE + '\\b',
                        relevance: 0,
                    },
                    s,
                    o,
                    a,
                ]),
            ]
            return (
                l.pop(),
                l.push(i),
                (r.contains = l),
                {
                    name: 'YAML',
                    case_insensitive: !0,
                    aliases: ['yml'],
                    contains: t,
                }
            )
        },
    })
    const be = m
    for (const B of Object.keys(ge)) {
        var he = B.replace('grmr_', '')
        be.registerLanguage(he, ge[B])
    }
    return be
})()
'object' == typeof exports &&
    'undefined' != typeof module &&
    (module.exports = hljs)
