class Entity {
    constructor() {
        this.health = 100;
        this.area = null;
        this.x = 0;
        this.y = 0;
        this.stats = {
            /* Defensive */
            maxHealth: {
                value: 100,
                maxLevel: 65536,
                growthType: 'linear',
                growthValue: 25
            },
            armour: {
                value: 0,
                maxLevel: 65536,
                growthType: 'rational',
                growthValue: 0.17,
                maxAddedValue: 0.9
            },
            regeneration: {
                value: 0.1,
                maxLevel: 65536,
                growthType: 'rational',
                growthValue: 0.48,
                maxAddedValue: 0.2
            },
            blocking: {
                value: 0.5,
                maxLevel: 65536,
                growthType: 'rational',
                growthValue: 0.27,
                maxAddedValue: 0.4
            },

            /* Offensive */
            attackDamage: {
                value: 15,
                maxLevel: 65536,
                growthType: 'linear',
                growthValue: 2
            },
            armorPenetration: {
                value: 0,
                maxLevel: 65536,
                growthType: 'rational',
                growthValue: 0.09,
                maxAddedValue: 0.99
            },
            attackSpeed: {
                value: 13 / 30,
                maxLevel: 7,
                growthType: 'linear',
                growthValue: -1 / 30
            },
            criticalChance: {
                value: 0,
                maxLevel: 20,
                growthType: 'linear',
                growthValue: 0.05
            },
            criticalPower: {
                value: 200,
                maxLevel: 20,
                growthType: 'linear',
                growthValue: 0.05
            },

            /* Special */
            movementSpeed: {
                value: 0.04,
                maxLevel: 20,
                growthType: 'linear',
                growthValue: 0.003
            },
            energyPool: {
                value: 100,
                maxLevel: 40,
                growthType: 'linear',
                growthValue: 10
            },
            energyRegeneration: {
                value: 20,
                maxLevel: 32,
                growthType: 'linear',
                growthValue: 2.5
            },
            lifeStealing: {
                value: 0,
                maxLevel: 65536,
                growthType: 'rational',
                growthValue: 0.06,
                maxAddedValue: 0.99
            },
            damageReflection: {
                value: 0,
                maxLevel: 65536,
                growthType: 'rational',
                growthValue: 0.07,
                maxAddedValue: 0.99
            },
            transformationHealer: {
                value: 5,
                maxLevel: 25,
                growthType: 'linear',
                growthValue: 1
            }
        }
    }

    tick() {
        throw new Error("Entity.tick() must be implemented");
    }

    takeDamage(damage) {
        if (this.health - damage <= 0) {
            this.health = 0;
        } else {
            this.health -= damage;
        }
    }

    getRadius() {
        return (this.health * 54) / 450 * 2; // This might be wrong, but it's a guess
    }

    calculateStatValue(stat, level) {
        const { value: initialValue, growthType, growthValue, maxAddedValue } = stat;

        if (growthType === 'linear') {
            return initialValue + (growthValue * level);
        } else if (growthType === 'rational') {
            const m = maxAddedValue;
            return initialValue + m - (1 / (1 / m + growthValue * level));
        }
        throw new Error("Unknown growth type");
    }

    canUpgradeStat(statName) {
        const stat = this.stats[statName];
        if (!stat) {
            throw new Error(`Invalid stat name: ${statName}`);
        }

        // Get current level by reverse engineering from current value
        const currentLevel = this.getStatLevel(statName);
        return currentLevel < stat.maxLevel;
    }

    getStatLevel(statName) {
        const stat = this.stats[statName];
        const currentValue = stat.value;

        if (stat.growthType === 'linear') {
            return Math.floor((currentValue - stat.value) / stat.growthValue);
        } else {
            // For rational growth, we need to solve the equation
            const m = stat.maxAddedValue;
            const v0 = stat.value;
            const g = stat.growthValue;
            return Math.floor((1 / (1 - (currentValue - v0 - m)) - 1 / m) / g);
        }
    }

    upgradeStat(statName) {
        if (!this.canUpgradeStat(statName)) {
            throw new Error(`Cannot upgrade ${statName} further`);
        }

        const stat = this.stats[statName];
        const currentLevel = this.getStatLevel(statName);
        const newValue = this.calculateStatValue(stat, currentLevel + 1);

        // Update the stat value
        stat.value = newValue;
        return newValue;
    }
}

module.exports = Entity;