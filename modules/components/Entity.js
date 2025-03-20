class Entity {
    constructor() {
        this.id = Math.random().toString(36).substr(2, 9);
        this.health = 100;
        this.area = null;
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.isSlasher = false;
        this.isCrasher = false;
        this.spikes = 0;

        // Define stat configurations
        this.stats = {
            // Defensive
            maxHealth: { 
                value: 100, level: 0, maxLevel: 65536,
                baseValue: 100, baseIncrease: 25,
                growthType: 'linear'
            },
            armor: { 
                value: 0, level: 0, maxLevel: 65536,
                baseValue: 0, baseIncrease: 0.17,
                growthType: 'rational', maxAddedValue: 0.9
            },
            regeneration: { 
                value: 0.1, level: 0, maxLevel: 65536,
                baseValue: 0.1, baseIncrease: 0.48,
                growthType: 'rational', maxAddedValue: 0.2
            },
            blocking: { 
                value: 0.5, level: 0, maxLevel: 65536,
                baseValue: 0.5, baseIncrease: 0.27,
                growthType: 'rational', maxAddedValue: 0.4
            },

            // Offensive
            attackDamage: { 
                value: 15, level: 0, maxLevel: 65536,
                baseValue: 15, baseIncrease: 2,
                growthType: 'linear'
            },
            armorPenetration: { 
                value: 0, level: 0, maxLevel: 65536,
                baseValue: 0, baseIncrease: 0.09,
                growthType: 'rational', maxAddedValue: 0.99
            },
            attackSpeed: { 
                value: 13/30, level: 0, maxLevel: 7,
                baseValue: 13/30, baseIncrease: -1/30,
                growthType: 'linear'
            },
            criticalChance: { 
                value: 0, level: 0, maxLevel: 20,
                baseValue: 0, baseIncrease: 0.05,
                growthType: 'linear'
            },
            criticalPower: { 
                value: 200, level: 0, maxLevel: 20,
                baseValue: 200, baseIncrease: 5,
                growthType: 'linear'
            },

            // Special
            movementSpeed: { 
                value: 0.04, level: 0, maxLevel: 20,
                baseValue: 0.04, baseIncrease: 0.003,
                growthType: 'linear'
            },
            energyPool: { 
                value: 100, level: 0, maxLevel: 40,
                baseValue: 100, baseIncrease: 10,
                growthType: 'linear'
            },
            energyRegeneration: { 
                value: 20, level: 0, maxLevel: 32,
                baseValue: 20, baseIncrease: 2.5,
                growthType: 'linear'
            },
            lifeSteal: { 
                value: 0, level: 0, maxLevel: 65536,
                baseValue: 0, baseIncrease: 0.06,
                growthType: 'rational', maxAddedValue: 0.99
            },
            damageReflection: { 
                value: 0, level: 0, maxLevel: 65536,
                baseValue: 0, baseIncrease: 0.07,
                growthType: 'rational', maxAddedValue: 0.99
            },
            transformationHealer: { 
                value: 0, level: 0, maxLevel: 25,
                baseValue: 0, baseIncrease: 1,
                growthType: 'linear'
            }
        };
    }

    upgradeStat(statId) {
        const stat = this.stats[statId];
        if (!stat) {
            throw new Error(`Invalid stat id: ${statId}`);
        }

        if (stat.level >= stat.maxLevel) {
            throw new Error(`Cannot upgrade ${statId} further`);
        }

        // Update level
        stat.level += 1;
        
        // Calculate new value based on growth type
        if (stat.growthType === 'rational') {
            const m = stat.maxAddedValue;
            const v0 = stat.baseValue;
            const g = stat.baseIncrease;
            stat.value = v0 + m - (1 / (1 / m + g * stat.level));
        } else { // linear
            stat.value = stat.baseValue + (stat.baseIncrease * stat.level);
        }

        return stat.value;
    }

    tick() {
        // throw new Error("Entity.tick() must be implemented");
    }

    takeDamage(damage) {
        if (this.health - damage <= 0) {
            this.health = 0;
        } else {
            this.health -= damage;
        }
    }

    getRadius() {
        return (this.stats.maxHealth.value * 54) / 450 * 2;
    }

    getClientData() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            radius: this.getRadius(),
            health: this.health,
            stats: this.stats,
            angle: this.angle,
            isSlasher: this.isSlasher,
            isCrasher: this.isCrasher,
            spikes: this.spikes,
            color: this.color
        };
    }
}

module.exports = Entity;