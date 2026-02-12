import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FetchGameSettingsData, SubscribeGameSettingsChanges } from "../../services/fetchData";
import { CalculateWPM } from "../../utils/wpmCalculator";
import { appendUserRound } from "../../services/supabaseData";
import { AccurancyPercentageCalculator } from "../../utils";
import { useGameStore } from "../../state";

type TextState = Record<string, string>;

export default function TextArea() {
    const {
        isGameStarted: startGame,
        setIsGameStarted: setStartGame,
        setShowResults,
        setGame,
        textVersion,
    } = useGameStore();
    const [userInput, setUserInput] = useState<string>("");
    const [charClasses, setCharClasses] = useState<string[]>([]);
    const [timer, setTimer] = useState<number>(FetchGameSettingsData(0).Timer);
    const [text, setText] = useState<string>(() => FetchGameSettingsData(0).CurrentText);
    const didMountRef = useRef(false);
    const timerRef = useRef<number>(timer);

    const [textState, setTextState] = useState<TextState>({
        Normal: "text-text-primary opacity-30",
        Correct: "text-text-correct",
        Incorrect: "text-text-incorrect",
        Upcoming: "text-text-upcoming opacity-20",
        Current: "text-text-current font-semibold border-b-4 border-white/50",
    });
    const textRef = useRef<string>(text);
    const gameSettingsRef = useRef(FetchGameSettingsData(0));
    const flatText = useMemo(() => text.split("\n").join(""), [text]);
    const paragraphs = useMemo(() => text.split("\n"), [text]);
    const userInputRef = useRef(userInput);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const totalErrorsRef = useRef(0);
    const totalTypedRef = useRef(0);
    const totalErrorLetters = useRef<string[]>([]);
    const hasSavedRoundRef = useRef(false);
    const elapsedSecondsRef = useRef(0);

    const saveRound = useCallback(async () => {
        if (hasSavedRoundRef.current) return;
        hasSavedRoundRef.current = true;

        const correct = Math.max(totalTypedRef.current - totalErrorsRef.current, 0);
        const elapsedSeconds = Math.max(elapsedSecondsRef.current, 0);
        const minutes = elapsedSeconds / 60;
        const round = {
            created_at: new Date().toISOString(),
            time: elapsedSeconds,
            text: text,
            accuracy: AccurancyPercentageCalculator(correct, Math.max(totalTypedRef.current, 1)),
            wpm: CalculateWPM(totalTypedRef.current, minutes),
            errorLetters: totalErrorLetters.current,
        };

        try {
            await appendUserRound(round);
        } catch (err) {
            // TODO: handle appendUserRound failure.
        }
    }, [flatText.length]);

    useEffect(() => {}, [setTextState]);

    const resetGame = useCallback(
        (nextText?: string) => {
            const resetText = nextText ?? textRef.current;
            const resetFlatText = resetText.split("\n").join("");
            const resetTimer = gameSettingsRef.current.Timer;

            setStartGame(false);
            setShowResults(false);

            setUserInput("");
            userInputRef.current = "";
            totalErrorsRef.current = 0;
            totalTypedRef.current = 0;
            totalErrorLetters.current = [];
            hasSavedRoundRef.current = false;
            elapsedSecondsRef.current = 0;

            setCharClasses(Array.from({ length: resetFlatText.length }, () => textState.Normal));
            setTimer(resetTimer);
            timerRef.current = resetTimer;

            setGame((prev) => ({
                ...prev,
                Seconds: 0,
                Minutes: 0,
                Accurancy: 0,
                Character: 0,
                CorrectCharacter: 0,
                WPM: 0,
                Errors: 0,
                LineGraphDataSet: [],
            }));

            requestAnimationFrame(() => {
                containerRef.current?.scrollTo({ top: 0 });
                containerRef.current?.focus();
            });
        },
        [setGame, setShowResults, setStartGame, textState]
    );

    const checkNewData = useCallback(() => {
        const nextSettings = FetchGameSettingsData(0);
        const prevSettings = gameSettingsRef.current;

        const textChanged = nextSettings.CurrentText !== prevSettings.CurrentText;
        const timerChanged = nextSettings.Timer !== prevSettings.Timer;
        const titleChanged = nextSettings.CurrentTitle !== prevSettings.CurrentTitle;

        if (!textChanged && !timerChanged && !titleChanged) return;

        gameSettingsRef.current = nextSettings;

        if (textChanged) {
            textRef.current = nextSettings.CurrentText;
            setText(nextSettings.CurrentText);
            resetGame(nextSettings.CurrentText);
            return;
        }

        if (timerChanged) {
            resetGame();
            return;
        }

        resetGame();
    }, [resetGame]);

    useEffect(() => {
        textRef.current = text;
    }, [text]);

    useEffect(() => {
        timerRef.current = timer;
    }, [timer]);

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }
        checkNewData();
    }, [checkNewData, textVersion]);

    useEffect(() => {
        containerRef.current?.focus();
    }, []);

    useEffect(() => {
        const unsubscribe = SubscribeGameSettingsChanges(checkNewData);
        checkNewData();
        return unsubscribe;
    }, [checkNewData]);

    useEffect(() => {
        setCharClasses(Array.from({ length: flatText.length }, () => textState.Normal));
    }, [flatText, textState]);

    const lineOffsets = useMemo(() => {
        const lines = text.split("\n");
        const offsets: number[] = [];
        let acc = 0;
        for (const line of lines) {
            offsets.push(acc);
            acc += line.length;
        }
        return offsets;
    }, [text]);

    useEffect(() => {
        if (!startGame) return;

        const hasTimeLimit = gameSettingsRef.current.Timer > 0;
        if (hasTimeLimit) {
            timerRef.current = gameSettingsRef.current.Timer;
            setTimer(timerRef.current);
        }

        const g = setInterval(() => {
            setGame((prev) => {
                const minutes = prev.Seconds / 60;
                const nextPoint = {
                    gameIndex: prev.LineGraphDataSet.length,
                    Seconds: prev.Seconds,
                    WPM: CalculateWPM(prev.Character, minutes),
                };
                return { ...prev, LineGraphDataSet: [...prev.LineGraphDataSet, nextPoint] };
            });
        }, 5000);

        const t = setInterval(() => {
            elapsedSecondsRef.current += 1;
            setGame((prev) => ({ ...prev, Seconds: prev.Seconds + 1 }));

            if (!hasTimeLimit) return;

            timerRef.current = Math.max(timerRef.current - 1, 0);
            setTimer(timerRef.current);

            if (timerRef.current > 0) return;

            setStartGame(false);
            (async () => {
                await saveRound();
                setShowResults(true);
            })();

            clearInterval(t);
            clearInterval(g);
        }, 1000);

        return () => {
            clearInterval(t);
            clearInterval(g);
        };
    }, [startGame, setGame, setShowResults, setStartGame]);

    useEffect(() => {
        const idx = userInput.length - 1;
        if (idx < 0) {
            setGame((prev) => ({
                ...prev,
                Character: totalTypedRef.current,
                CorrectCharacter: Math.max(totalTypedRef.current - totalErrorsRef.current, 0),
            }));
            setCharClasses(Array.from({ length: flatText.length }, () => textState.Normal));
            return;
        }

        const isCorrect = userInput[idx] == flatText[idx];
        let correctCount = 0;
        const max = Math.min(userInput.length, flatText.length);
        for (let i = 0; i < max; i += 1) {
            if (userInput[i] === flatText[i]) correctCount += 1;
        }
        setGame((prev) => ({
            ...prev,
            Character: totalTypedRef.current,
            CorrectCharacter: Math.max(totalTypedRef.current - totalErrorsRef.current, 0),
        }));
        setCharClasses((prev) => {
            const next = [...prev];
            next[idx] = isCorrect ? textState.Correct : textState.Incorrect;
            if (idx + 1 < next.length) next[idx + 1] = textState.Current;
            if (idx + 2 < next.length) next[idx + 2] = textState.Upcoming;
            return next;
        });

        const container = containerRef.current;
        let el: Element | null = null;
        if (container) {
            for (let i = idx; i < flatText.length; i += 1) {
                el = container.querySelector(`[data-idx="${i}"]`);
                if (el) break;
            }
            if (!el) {
                for (let i = idx - 1; i >= 0; i -= 1) {
                    el = container.querySelector(`[data-idx="${i}"]`);
                    if (el) break;
                }
            }
        }
        if (container && el instanceof HTMLElement) {
            const targetTop = el.offsetTop - container.clientHeight / 2 + el.offsetHeight / 2;
            const maxTop = Math.max(container.scrollHeight - container.clientHeight, 0);
            const nextTop = Math.max(0, Math.min(targetTop, maxTop));
            container.scrollTo({ top: nextTop });
        }

        if (idx >= flatText.length - 1) {
            setStartGame(false);
            (async () => {
                await saveRound();
                setShowResults(true);
            })();
        }
    }, [userInput, flatText, saveRound, setGame, setShowResults, setStartGame, textState]);

    const renderLine = (line: string, lineIndex: number) => {
        let localIndex = 0;

        return line.split(/(\s+)/).map((token, tIndex) => {
            const startIndex = localIndex;
            localIndex += token.length;

            if (token.trim() === "") {
                return <span key={tIndex}>{token}</span>;
            }

            return (
                <span key={tIndex} className="whitespace-nowrap">
                    {token.split("").map((char, i) => {
                        const globalIndex = lineOffsets[lineIndex] + startIndex + i;
                        const cls = charClasses[globalIndex] ?? textState.Normal;
                        return (
                            <span key={i} data-idx={globalIndex} className={`inline-block ${cls} transition-colors duration-100`}>
                                {char}
                            </span>
                        );
                    })}
                </span>
            );
        });
    };

    const showCountdown = gameSettingsRef.current.Timer > 0;

    return (
        <div className="relative w-full h-2/5">
            {showCountdown && (
                <div className="absolute top-3 right-3 z-10 rounded-md border border-card-border bg-game-bg-light px-3 py-1 text-sm font-semibold text-text-primary shadow-card pointer-events-none">
                    {timer}
                </div>
            )}

            <div
                ref={containerRef}
                tabIndex={0}
                onClick={() => containerRef.current?.focus()}
                onKeyDown={(e) => {
                    const currentKey = e.key;

                    if (currentKey === "Escape") {
                        e.preventDefault();
                        resetGame();
                        return;
                    }

                    const isTypingKey =
                        currentKey === "Backspace" ||
                        (currentKey.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey);

                    if (!isTypingKey) return;

                    e.preventDefault();
                    if (!startGame) {
                        setStartGame(true);
                    }

                    if (currentKey === "Backspace") {
                        if (userInputRef.current.length === 0) return;
                        setUserInput((prevInput) => {
                            const newInput = prevInput.slice(0, prevInput.length - 1);
                            userInputRef.current = newInput;
                            return newInput;
                        });
                        return;
                    }

                    if (userInputRef.current.length >= flatText.length) return;
                    const inputIndex = userInputRef.current.length;
                    totalTypedRef.current += 1;
                    if (flatText[inputIndex] !== currentKey) {
                        totalErrorsRef.current += 1;
                        totalErrorLetters.current.push(flatText[inputIndex]);
                    }
                    setUserInput((prevInput) => {
                        const newInput = prevInput + currentKey;
                        userInputRef.current = newInput;
                        return newInput;
                    });
                }}
                className="w-full h-full bg-card-bg p-10 rounded-xl text-text-primary text-typing-xxl font-mono outline-none shadow-card border-2 border-card-border overflow-y-scroll hover:border-accent-warning focus:border-accent-primary transition-all duration-300 backdrop-blur-sm"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#3a352f #211e1b'
                }}
            >
                {paragraphs.map((line, lineIndex) => (
                    <p key={lineIndex} className="whitespace-pre-wrap leading-relaxed">
                        {renderLine(line, lineIndex)}
                    </p>
                ))}

            </div>
        </div>
    );
}
