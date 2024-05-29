import { useEffect, useState } from 'react';
import useSound from "use-sound";

import './App.scss';
import data from "./data/types.json";

function App() {
  const [selectedTypes, setSelectedTypes] = useState({
    attacker: null,
    defender: null
  });
  const [attackerId, setAttackerId] = useState(0);
  const [defenderId, setDefenderId] = useState(0);

  const [volume] = useState(.2);
  const [muted, setMuted] = useState(false);
  const [audioSuperEffective] = useSound(require("./audio/super_effective.mp3"), { volume });
  const [audioNotVeryEffective] = useSound(require("./audio/not_very_effective.mp3"), { volume });
  const [audioNormalDamage] = useSound(require("./audio/normal_damage.mp3"), { volume });

  useEffect(() => {
    if (window.innerWidth < 800 || window.innerHeight < 800) {
      setMuted(true);
    }
  }, []);

  function handleClick(attacker, defender, attackerId, defenderId) {
    setSelectedTypes({
      attacker: attacker,
      defender: defender
    });

    setAttackerId(attackerId);
    setDefenderId(defenderId);
  };


  const getEffectiveness = (attackType, defenseType) => {
    if (attackType.immune_against.includes(defenseType.slug)) {
      return "immune";
    } else if (attackType.weak_against.includes(defenseType.slug)) {
      return "not-very-effective";
    } else if (attackType.strong_against.includes(defenseType.slug)) {
      return "super-effective";
    } else {
      return "normal-damage";
    }
  };

  const turnToText = (effectiveness) => {
    switch (effectiveness) {
      case "immune":
        return "Immune";
      case "not-very-effective":
        return "Not very effective";
      case "super-effective":
        return "Super effective!";
      case "normal-damage":
        return "Normal";
      default:
        throw new Error("Unexpected effectiveness: " + effectiveness);
    }
  }

  const playAudio = (effectiveness) => {
    console.log(effectiveness);
    switch (effectiveness) {
      case "super-effective":
        audioSuperEffective();
        break;
      case "not-very-effective":
        audioNotVeryEffective();
        break;
      case "normal-damage":
        audioNormalDamage();
        break;
      default:
        break;
    }
  }

  const userLang = (navigator.language || navigator.userLanguage).toUpperCase();

  return (
    <>
      <button id="mute-btn" className={muted ? "muted" : "unmuted"} onClick={() => setMuted(!muted)}></button>
      <section id="board-container" onClick={() => setSelectedTypes({ attacker: null, defender: null })}>
        <div id="board" className={selectedTypes.attacker || selectedTypes.defender ? "type-focus" : ""}>
          <div className="row">
            <div className="blank">
              <img id="sword" src={require("./ui/sword.webp")} alt="sword" />
              <img id="shield" src={require("./ui/shield.webp")} alt="shield" />
              <img id="pokeball" src={require("./ui/pokeball.webp")} alt="pokeball" />
            </div>
            {data.map((type, i) => (
              <div className={"type-cell horizontal" + (type.slug === selectedTypes.defender ? " focus" : "")} key={type.slug}>
                <div className={`type-color ${type.slug}`} onClick={() => handleClick(selectedTypes.attacker, type.slug, attackerId, i)}>
                  <img className="type-icon" src={require(`./types/${type.slug}.svg`)} alt={type.slug} />
                  <p className="type-name">{type.name[userLang] || type.name.EN}</p>
                </div>
              </div>
            ))}
          </div>
          {data.map((attackType, i) => (
            <div className="row" key={attackType.slug}>
              <div className={"type-cell vertical" + (attackType.slug === selectedTypes.attacker ? " focus" : "")}>
                <div className={`type-color ${attackType.slug}`} onClick={() => handleClick(attackType, selectedTypes.defender, i, defenderId)}>
                  <img className="type-icon" src={require(`./types/${attackType.slug}.svg`)} alt={attackType.slug} />
                  <p className="type-name">{attackType.name[userLang] || attackType.name.EN}</p>
                </div>
              </div>
              {data.map((defenseType, j) => {
                const effectiveness = getEffectiveness(attackType, defenseType);
                const current = selectedTypes && (
                  selectedTypes.attacker === attackType.slug ||
                  selectedTypes.defender === defenseType.slug
                );
                const preciselySelected = selectedTypes && (selectedTypes.attacker === attackType.slug && selectedTypes.defender === defenseType.slug);

                return <div
                  className={`cell ${effectiveness} ${(current && (i < attackerId || j < defenderId)) || preciselySelected ? "focus" : ""} ${preciselySelected ? "precisely-selected" : ""}`.trim()}
                  key={defenseType.slug}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(attackType.slug, defenseType.slug, i, j);
                    if (!muted) playAudio(effectiveness);
                  }}
                >
                  <p className="message">
                    {turnToText(getEffectiveness(attackType, defenseType))}
                  </p>
                </div>
              })}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default App;
