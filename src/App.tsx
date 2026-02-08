import { useEffect, useState } from "react";
import { Results, TextArea, Toolbar, Title, Profile, Button} from "./components";
import addUserStatsData from "./tools/superbaseData";

import {
  AccurancyPercentageCalculator,
  CalculateWPM,
  FetchGameData,
  UpdateText,
  type Game,
} from "./tools";

function App() {
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [game, setGame] = useState<Game>(() => FetchGameData(0));
  const [textVersion, setTextVersion] = useState<number>(0);

  const [textHover, setTextHover] = useState<boolean>(false);

  useEffect(() => {
    UpdateText();
    setTextVersion(v => v + 1);
  }, []);

  useEffect(() => {
    setGame((prev) => {
      const Minutes = prev.Seconds / 60;
      const WPM = CalculateWPM(prev.Character, Minutes);
      const Errors = prev.Character - prev.CorrectCharacter;
      const Accurancy = AccurancyPercentageCalculator(prev.CorrectCharacter, prev.Character);

      if ( Minutes === prev.Minutes && WPM === prev.WPM &&
        Errors === prev.Errors && Accurancy === prev.Accurancy ) {
        return prev;
      }

      return { ...prev, Minutes, WPM, Errors, Accurancy };
    });
  }, [game.Seconds, game.Character, game.CorrectCharacter]);

  useEffect(() => {
    addUserStatsData();
  }, [showResults])

  const handleClick = () =>{
    setShowResults(!showResults)
  }

  return (
    <div className="theme-warm-sunset">
      <div className="w-screen h-screen bg-game-bg overflow-hidden">
        <div className="w-full h-full flex flex-wrap items-center justify-center">
          {showResults ? 
            <div className="w-full h-full flex flex-row">
              <div className="absolute w-fit h-fit flex items-start p-5">
                <Button onClickFunction={handleClick} text={"⟳"}/>
              </div>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-4/5 h-4/5">
                  <Results setShowResults={setShowResults} game={game} />
                </div>
              </div>
            </div>
            :
            <>
              <div className=" w-1/5 h-full flex-0">
                <Profile/>
              </div>
              <div className="w-1/5 h-full flex flex-col gap-3 justify-center items-center flex-1">
                <Toolbar onTextUpdate={() => setTextVersion((v) => v + 1)} />
                <TextArea
                  startGame={isGameStarted}
                  setStartGame={setIsGameStarted}
                  setShowResults={setShowResults}
                  setGame={setGame}
                  textVersion={textVersion}
                />
                <div className={`w-[98%] flex flex-row items-center justify-start`} onMouseEnter={() => setTextHover(true)} onMouseLeave={() => setTextHover(false)} >
                  <Title glow={textHover ? true : false}/>
                </div>
              </div> 
              <div className="w-1/5 h-full flex-2">

              </div>
            </>
          }
        </div>
      </div>
    </div>
  )
}

export default App
