// recipes.js

// We'll attach our functions to a global object to avoid polluting the global namespace.
window.dinnerApp = {

    getRecipes: function() {

        const todayMains = [
            {
                id: 'marry-me-chicken',
                name: 'marry me chicken',
                options: [
                    { id: 'mushrooms', label: 'mushrooms', type: 'checkbox', default: true },
                ]
            },
        ]

        const randomRecipes = [

        ]

        const recipes = [
            ...todayMains,
            {
                id: 'egg-noodle',
                name: 'egg noodle',
                options: [
                    { id: 'egg-count', label: 'number of eggs', type: 'number', default: 3 },
                ]
            },
            ...randomRecipes
        ];
        return recipes;
    },

    getSides: function() {
        const todaySides = [
            {
                id: 'baguette',
                name: 'baguette'
            },
            {
                id: 'brussel sprouts',
                name: 'brussel sprouts'
            },
        ]

        const randomSides = [
            
        ]

        const sides = [
            ...todaySides,
            {
                id: 'yam',
                name: 'Yam'
            },
            ...randomSides
        ]

        return sides;
    }
}; 