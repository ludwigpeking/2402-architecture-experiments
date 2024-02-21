function duplicateAndMutate(house) {
    // console.log("mutating");
    const newGenotype = mutate(house.genotype);
    const newHouse = new House(newGenotype, frameCount);

    return newHouse;
}

function twoHousesCrossOver(house1, house2) {
    const newGenotype = crossOver(house1.genotype, house2.genotype);
    const newHouse = new House(newGenotype, frameCount);

    return newHouse;
}

function mutate(genotype) {
    // let attempts =0;
    // while (attempts < 1000) {
    //     let newGenotype = deepCopy(genotype);
    // }

    let isValid = false; // Flag to track if the new genotype is valid
    let newGenotype = [];
    let attempts = 0; // To prevent infinite loop
    let inValidType = "";
    const levelNumber = genotype.length - 1;
    const segments = genotype[0].length - 2;
    const flattenedGenotype = genotype.slice(0).flat(2);

    while (!isValid && attempts < 1000) {
        // Limit attempts to avoid infinite loop
        // Flatten all the elements in the genotype array layers

        const randomIndex = floor(random(0, flattenedGenotype.length));
        const randomMove = p5.Vector.random2D().mult(
            random(0, 50) //* mutationMagnitude
        );
        // const randomPoint = createRandomPointInPolygon(propertyLine);
        // console.log(
        //     "flattenedGenotype[randomIndex]",
        //     flattenedGenotype[randomIndex]
        // );
        if (flattenedGenotype[randomIndex] !== null) {
            const vectorCopy = flattenedGenotype[randomIndex]
                .copy()
                .add(randomMove);

            // Now, use vectorCopy instead of directly modifying the original vector
            flattenedGenotype[randomIndex] = vectorCopy;
            // console.log(
            //     "randomIndex",
            //     randomIndex,
            //     "randomPoint",
            //     randomPoint,
            //     "flattenedGenotype[randomIndex]",
            //     flattenedGenotype[randomIndex]
            // );

            //sort the polygon vertices of each floor
            for (let i = 0; i < levelNumber; i++) {
                let toSort = flattenedGenotype.slice(
                    i * (segments + 2),
                    (i + 1) * (segments + 2) - 2
                );
                sortVertices(toSort);
                for (let j = 0; j < toSort.length; j++) {
                    flattenedGenotype[i * (segments + 2) + j] = toSort[j];
                }
            }

            newGenotype = [];
            for (let i = 0; i < levelNumber; i++) {
                //use sortVertices to sort the segement number of vertices of each floor

                newGenotype.push(
                    flattenedGenotype.slice(
                        i * (segments + 2),
                        (i + 1) * (segments + 2)
                    )
                );
                // sortVertices(newGenotype[i].slice(0, segments));
            }
            // console.log("flattenedGenotype", flattenedGenotype);
            newGenotype.push(flattenedGenotype.slice(-1)[0]); // Ensure the last element is included correctly

            // Check the validity of the new genotype
            isValid = true; // Assume valid until proven otherwise

            for (let i = 0; i < segments; i++) {
                if (
                    !isLineInsidePolygon(
                        newGenotype[0][i],
                        newGenotype[0][i + 1] % newGenotype[0].length,
                        propertyLine
                    )
                ) {
                    isValid = false;
                    inValidType = "over propertyLine";
                }
            }

            for (let i = 1; i < levelNumber && isValid; i++) {
                for (let j = 0; j < segments; j++) {
                    if (
                        !isLineInsidePolygon(
                            newGenotype[0][i],
                            newGenotype[0][i + 1] % newGenotype[0].length,
                            newGenotype[i - 1]
                        )
                    ) {
                        isValid = false;
                        inValidType = "over previous floor";
                    }
                }
            }
            if (
                !isPointInPolygon(
                    newGenotype[newGenotype.length - 1],
                    newGenotype[0].slice(0, segments)
                )
            ) {
                isValid = false;
                inValidType = "central point over first floor";
            }
        }
        attempts++;
    }
    // console.log("IsValid", isValid);
    // Return the original genotype if a valid mutation wasn't found
    // Otherwise, return the valid new genotype
    // if (!isValid) console.log("attempts", attempts, inValidType);

    return isValid ? newGenotype : genotype;
}

function crossOver(genotype1, genotype2) {
    let isValid = false; // Flag to track if the new genotype is valid
    let newGenotype = [];
    let attempts = 0; // To prevent infinite loop

    const levelNumber = genotype1.length - 1;
    const segments = genotype1[0].length - 2;
    const flattenedGenotype1 = genotype1.slice(0).flat(2);
    const flattenedGenotype2 = genotype2.slice(0).flat(2);

    while (!isValid && attempts < 1000) {
        // Limit attempts to avoid infinite loop
        // Flatten all the elements in the genotype array layers

        const randomIndex = Math.floor(
            Math.random() * flattenedGenotype1.length
        );
        let flattenedGenotype = [
            ...flattenedGenotype1.slice(0, randomIndex),
            ...flattenedGenotype2.slice(randomIndex),
        ];

        //sort the polygon vertices of each floor
        for (let i = 0; i < levelNumber; i++) {
            let toSort = flattenedGenotype.slice(
                i * (segments + 2),
                (i + 1) * (segments + 2) - 2
            );
            sortVertices(toSort);
            for (let j = 0; j < toSort.length; j++) {
                flattenedGenotype[i * (segments + 2) + j] = toSort[j];
            }
        }

        newGenotype = [];
        for (let i = 0; i < levelNumber; i++) {
            //use sortVertices to sort the segement number of vertices of each floor

            newGenotype.push(
                flattenedGenotype.slice(
                    i * (segments + 2),
                    (i + 1) * (segments + 2)
                )
            );
            // sortVertices(newGenotype[i].slice(0, segments));
        }
        // console.log("flattenedGenotype", flattenedGenotype);
        newGenotype.push(flattenedGenotype.slice(-1)[0]); // Ensure the last element is included correctly

        // Check the validity of the new genotype
        isValid = true; // Assume valid until proven otherwise
        for (let i = 0; i < segments; i++) {
            if (!isPointInPolygon(newGenotype[0][i], propertyLine)) {
                isValid = false;
            }
        }

        for (let i = 1; i < levelNumber && isValid; i++) {
            for (let j = 0; j < segments; j++) {
                if (!isPointInPolygon(newGenotype[i][j], newGenotype[i - 1])) {
                    isValid = false;
                }
            }
        }
        if (
            !isPointInPolygon(
                newGenotype[newGenotype.length - 1],
                newGenotype[0].slice(0, segments)
            )
        ) {
            isValid = false;
        }

        attempts++;
    }
    // console.log("IsValid", isValid);
    // Return the original genotype if a valid crossover wasn't found
    // Otherwise, return the valid new genotype
    // if (!isValid) console.log("crossing failed");
    return isValid ? newGenotype : genotype1;
}
