import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './UpgradesMenu.module.css';

const STAT_CATEGORIES = [
    {
        title: "Defensive Attributes",
        color: "rgb(210, 210, 210)",
        stats: [
            { 
                id: "maxHealth", 
                name: "Max Health", 
                baseValue: 100,
                baseIncrease: 25,  // growthValue for linear growth
                costMultiplier: 1.15
            },
            { 
                id: "armor", 
                name: "Armor", 
                baseValue: 0,
                baseIncrease: 0.17, // growthValue for rational growth
                costMultiplier: 1.2,
                maxAddedValue: 0.9
            },
            { 
                id: "regeneration", 
                name: "Regeneration", 
                baseValue: 0.1,
                baseIncrease: 0.48, // growthValue for rational growth
                costMultiplier: 1.3,
                maxAddedValue: 0.2
            },
            {
                id: "blocking",
                name: "Blocking",
                baseValue: 0.5,
                baseIncrease: 0.27, // growthValue for rational growth
                costMultiplier: 1.25,
                maxAddedValue: 0.4
            }
        ]
    },
    {
        title: "Offensive Attributes",
        color: "#ffc600",
        stats: [
            { 
                id: "attackDamage", 
                name: "Attack Damage", 
                baseValue: 15,
                baseIncrease: 2,   // growthValue for linear growth
                costMultiplier: 1.15
            },
            { 
                id: "armorPenetration", 
                name: "Armor Penetration", 
                baseValue: 0,
                baseIncrease: 0.09, // growthValue for rational growth
                costMultiplier: 1.25,
                maxAddedValue: 0.99
            },
            { 
                id: "attackSpeed", 
                name: "Attack Speed", 
                baseValue: 13/30,
                baseIncrease: -1/30, // growthValue for linear growth
                costMultiplier: 1.3,
                maxLevel: 7
            },
            {
                id: "criticalChance",
                name: "Critical Chance",
                baseValue: 0,
                baseIncrease: 0.05, // growthValue for linear growth
                costMultiplier: 1.3,
                maxLevel: 20
            },
            {
                id: "criticalPower",
                name: "Critical Power",
                baseValue: 200,
                baseIncrease: 5,
                costMultiplier: 1.3,
                maxLevel: 20
            }
        ]
    },
    {
        title: "Special Attributes",
        color: "#da99ff",
        stats: [
            { 
                id: "movementSpeed", 
                name: "Movement Speed", 
                baseValue: 0.04,
                baseIncrease: 0.003, // growthValue for linear growth
                costMultiplier: 1.2,
                maxLevel: 20
            },
            {
                id: "energyPool",
                name: "Energy Pool",
                baseValue: 100,
                baseIncrease: 10,   // growthValue for linear growth
                costMultiplier: 1.3,
                maxLevel: 40
            },
            {
                id: "energyRegeneration",
                name: "Energy Regen",
                baseValue: 20,
                baseIncrease: 2.5,  // growthValue for linear growth
                costMultiplier: 1.3,
                maxLevel: 32
            },
            { 
                id: "lifeSteal", 
                name: "Life Steal", 
                baseValue: 0,
                baseIncrease: 0.06, // growthValue for rational growth
                costMultiplier: 1.4,
                maxAddedValue: 0.99
            },
            { 
                id: "damageReflection", 
                name: "Damage Reflection", 
                baseValue: 0,
                baseIncrease: 0.07, // growthValue for rational growth
                costMultiplier: 1.35,
                maxAddedValue: 0.99
            },
            {
                id: "transformationHealer",
                name: "Healer Transform",
                baseValue: 0,
                baseIncrease: 1,
                costMultiplier: 1.4,
                maxLevel: 25
            }
        ]
    }
];

const formatValue = (stat, value) => {
    switch (stat.id) {
        case 'attackSpeed':
            return `${value.toFixed(2)}s`;
        case 'movementSpeed':
            return (value * 100).toFixed(2);
        case 'criticalChance':
        case 'lifeSteal':
        case 'damageReflection':
        case 'armor':
        case 'armorPenetration':
        case 'blocking':
            return `${(value * 100).toFixed(2)}%`;
        case 'criticalPower':
            return `${value.toFixed(0)}%`;
        case 'regeneration':
            return `${value.toFixed(2)}/s`;
        case 'energyPool':
        case 'energyRegeneration':
        case 'maxHealth':
        case 'attackDamage':
        case 'transformationHealer':
            return value >= 1000 ? 
                `${(value/1000).toFixed(1)}k` : 
                Math.round(value).toString();
        default:
            return Math.round(value).toString();
    }
};

const SkillInfo = ({ stat, playerStats, getNextValue }) => {
    return ReactDOM.createPortal(
        <div className={styles.skillInfo}>
            <div className={styles.skillInfoName}>
                {stat.name}
            </div>
            <hr />
            <div className={styles.skillInfoItem}>
                Current
                <span className={styles.skillInfoRight}>
                    <span className={styles.skillInfoValue}>
                        {formatValue(stat, playerStats[stat.id].value)}
                    </span>
                    {' ('}
                    <span className={styles.skillInfoAmount}>
                        {playerStats[stat.id].level}
                    </span>
                    {')'}
                </span>
            </div>
            <hr />
            <div className={styles.skillInfoItem}>
                Next
                <span className={styles.skillInfoRight}>
                    <span className={styles.skillInfoValue}>
                        {formatValue(stat, getNextValue(stat, playerStats[stat.id]))}
                    </span>
                    {' ('}
                    <span className={styles.skillInfoAmount}>
                        {playerStats[stat.id].level + 1}
                    </span>
                    {')'}
                </span>
            </div>
        </div>,
        document.body
    );
};

const UpgradesMenu = ({ playerName, playerStats, onUpgrade, availablePoints }) => {
    const [hoveredStat, setHoveredStat] = useState(null);

    const handleUpgrade = (statId) => {
        if (availablePoints > 0) {
            onUpgrade(statId);
        }
    };

    // Calculate next level value for a stat
    const getNextValue = (stat, currentStat) => {
        if (stat.maxLevel && currentStat.level >= stat.maxLevel) {
            return currentStat.value;
        }
        
        if (stat.maxAddedValue) {
            // Rational growth
            const m = stat.maxAddedValue;
            const v0 = stat.baseValue;
            const g = stat.baseIncrease;
            const nextLevel = currentStat.level + 1;
            return v0 + m - (1 / (1 / m + g * nextLevel));
        } else {
            // Linear growth
            return currentStat.value + stat.baseIncrease;
        }
    };

    return (
        <div className={styles.upgradesMenu}>
            <div className={styles.playerName}>{playerName}</div>
            <div className={styles.availablePoints}>
                Points Available: {availablePoints}
            </div>

            {STAT_CATEGORIES.map((category, index) => (
                <div key={index} className={styles.category}>
                    <div 
                        className={styles.categoryTitle} 
                        style={{ color: category.color }}
                    >
                        {category.title}
                    </div>
                    
                    <div className={styles.statsContainer}>
                        {category.stats.map(stat => {
                            const currentStat = playerStats[stat.id];
                            if (!currentStat) return null;

                            return (
                                <div 
                                    key={stat.id} 
                                    className={styles.statRow}
                                    onMouseEnter={() => setHoveredStat(stat)}
                                    onMouseLeave={() => setHoveredStat(null)}
                                >
                                    <span className={styles.statName}>
                                        {stat.name}
                                    </span>
                                    <span className={styles.statValue}>
                                        {formatValue(stat, currentStat.value)}
                                    </span>
                                    <button
                                        className={styles.upgradeButton}
                                        onClick={() => handleUpgrade(stat.id)}
                                        disabled={availablePoints <= 0}
                                        title={`Level ${currentStat.level}`}
                                    >
                                        +
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {index < STAT_CATEGORIES.length - 1 && <hr className={styles.divider} />}
                </div>
            ))}
            {hoveredStat && (
                <SkillInfo 
                    stat={hoveredStat} 
                    playerStats={playerStats} 
                    getNextValue={getNextValue}
                />
            )}
        </div>
    );
};

export default UpgradesMenu; 