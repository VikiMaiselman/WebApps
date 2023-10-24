import mongoose from 'mongoose';
let coinModel, activityModel, sectionModel, wishesModel, colorsModel, scoreModel;
let allCoins;

export async function initDatabaseAndSchemas() {
    try {
        await mongoose.connect("mongodb://localhost:27017/collectCoins");

        const coinSchema = new mongoose.Schema({
            color: {
                type: String,
                required: true,
            }, 
            value: {
                type: Number,
                required: true,
            }, 
            sectionName: {
                type: String,
                required: true,
            }
        });

        const activitySchema = new mongoose.Schema({
            name: {
                type: String,
                required: true,
            }, 
            price: [coinSchema],
        });

        const sectionSchema = new mongoose.Schema({
            name: {
                type: String,
                unique: true,
                required: true,
            }, 
            color: String,
            activities: [activitySchema],
        });

        const wishesSchema = new mongoose.Schema({
            name: {
                type: String,
                required: true,
            }, 
            price: [coinSchema],
        });

        const colorsSchema = new mongoose.Schema({
            color: {
                type: String,
                unique: true,
                required: true,
            },
            sectionName: {
                type: String,
                unique: true,
                required: true,
            }
        });

        const scoreSchema = new mongoose.Schema({
            price: [coinSchema]
        });

        coinModel = mongoose.model("Coin", coinSchema);
        activityModel = mongoose.model("Activity", activitySchema);
        sectionModel = mongoose.model("Section", sectionSchema);
        wishesModel = mongoose.model("Wishes", wishesSchema);
        colorsModel = mongoose.model("Colors", colorsSchema);

        scoreModel = mongoose.model("Score", scoreSchema);
    
        const collections = await mongoose.connection.db.listCollections().toArray();
        let isFound = false;

        for (let collection of collections) {
            if (collection.name === 'scores') {
                allCoins = await scoreModel.find();
                allCoins = allCoins[0];
                isFound = true;
            }
        }
       
        if (!isFound) {
            allCoins = new scoreModel({
                price:[],
            });
            await allCoins.save();
        }
    } catch(error) {
        console.error(error);
    }
}

export async function getAllSections() {
    try {
        return await sectionModel.find();
    } catch(error) {
        console.error(error);
    }
}

export async function getSectionColorAndName(sectionId) {
    try {
        const section = await sectionModel.find({_id: sectionId});
        return [section[0].color, section[0].name];
    } catch(error) {
        console.error(error);
    }
}

export async function createSection(dataFromUI) {
    try {
        const newSection = new sectionModel({
            name: dataFromUI.name,
            color: dataFromUI.color,
            activities: [],
        });
        await newSection.save();
        return newSection;
    } catch(error) {
        console.error(error);
    }
}

export async function deleteSection(sectionId) {
    try {
        const totalPrice = allCoins.price;
        const section = await sectionModel.find({_id: sectionId}, {name: 1, color: 1});
        const sectionName = section[0].name;
        const sectionColor = section[0].color;
    
        for (let score of totalPrice) {
            if (score.sectionName === sectionName && 
                score.value > 0) throw new Error ("Impossible to delete this section, you still have its coins. Buy something.")
        }

        removeColor(sectionColor);
        await sectionModel.deleteOne({_id: sectionId});
    } catch(error) {
        console.error(error);
        throw error;
    }
}

async function removeColor(sectionColor) {
    try {
        const allColors = await colorsModel.find();
        let colorId;

        for (let color of allColors) {
            if (color.color === sectionColor) {
                colorId = color._id;
            }
        }
        await colorsModel.deleteOne({_id: colorId})
    } catch(error) {
        console.error(error);
      }
}

export async function createActivityInSection(dataFromUI) {
    try {
        const allCoins = createCoins(dataFromUI.coins);

        const newActivity = new activityModel({
            name: dataFromUI.name,
            price: allCoins,
        });

        const sectionId = dataFromUI.id;
        await sectionModel.updateOne({_id: sectionId}, {$push: {activities: newActivity}});

    } catch(error) {
        console.error(error);
    }
}

function createCoins(coins){
    return coins.map(coin => {
        return new coinModel({color: coin.color, value: coin.value, sectionName: coin.sectionName});
    })
}

export async function deleteActivityInSection(activityId, sectionId) {
    try {
        await sectionModel.findOneAndUpdate({_id: sectionId}, {$pull: 
            {
                activities : {
                _id: activityId,
                }
            }
        });
    } catch(error) {
        console.error(error);
    }
}

export async function addCoinsFromActivity(sectionId, activityId, ) {
    try {
        let needNewCoin = true; 
        const activity = await sectionModel.findOne({_id: sectionId, 'activities._id': activityId},
                                                     { 'activities.$': 1, name: 1 });


         for (let coin of allCoins.price) {
            if (coin.color === activity.activities[0].price[0].color) {
                needNewCoin = false;
                coin.value += activity.activities[0].price[0].value;
                await allCoins.save();
            }
        }

        if (needNewCoin) {
            const newCoin = new coinModel({
                color: activity.activities[0].price[0].color,
                value: activity.activities[0].price[0].value,
                sectionName: activity.name,
            });
            allCoins.price.push(newCoin);
            await allCoins.save();
        }
    } catch(error) {
        console.error(error);
    }
}

export async function getTotalScore() {
    try {
        let total = 0;
        for (let unit of allCoins.price) {
            total += unit.value;
        }
        return total;
    } catch (error) {
        console.error(error);
    }
}

export async function getAllCoinPrices() {
    return allCoins.price;
}

/* ******************* W I S H E S ******************* */
export async function getAllWishes() {
    try {
        return await wishesModel.find();
    } catch(error) {
        console.error(error);
    }
}

export async function createWish(dataFromUI) {
    try {
        const allCoins = createCoins(dataFromUI.coins);
        const newWish = new wishesModel({ name: dataFromUI.name, price: allCoins })
        await newWish.save();
    } catch(error) {
        console.error(error);
    }
}

export async function deleteWish(wishId) {
    try {
        await wishesModel.deleteOne({_id: wishId});
    } catch(error) {
        console.error(error);
    }
}

export async function accomplishWishAndDelete(wishId) {
    try {
        const wishObject = await wishesModel.find({_id: wishId});
        const wishTotalPrice = wishObject[0].price;
        const totalCoinsPrice = allCoins.price;

        // 1st run - check if it is legitimate to accomplish wish
        for (let coin of totalCoinsPrice) {
            for (let wishSubprice of wishTotalPrice) {
                if (coin.color === wishSubprice.color) {
                    if (coin.value < wishSubprice.value) throw new Error("Not enough coins of one or more colors. Work harder for this wish.");
                }
            }
        }

        let wishPricesCounter = 0; 
        for (let coin of totalCoinsPrice) {
            for (let wishSubprice of wishTotalPrice) {
                if (coin.color === wishSubprice.color) ++ wishPricesCounter; 
            }
        }

        if (wishPricesCounter !== wishTotalPrice.length) throw new Error("Coins of some color are missing. You might have deleted the section and cannot replenish the coins from it. Consider deleting the wish and redefine it.");

        // 2nd run - extract wish prices from coins' values
        for (let coin of totalCoinsPrice) {
            for (let wishSubprice of wishTotalPrice) {
                if (coin.color === wishSubprice.color) {
                    coin.value = coin.value - wishSubprice.value;
                }
            }
        }

        await wishesModel.deleteOne({_id: wishId});
    } catch(error) {
        console.error(error);
        throw error;
    }
}

export async function getAllColors() {
  try {
    return await colorsModel.find();
  } catch(error) {
    console.error(error);
  }
}

export async function addNewColor(color, sectionName) {
    try {
        const newColor = new colorsModel({
            color: color,
            sectionName: sectionName
        });
        await newColor.save();
    } catch(error) {
        console.error(error);
      }
}

export async function findSectionNameByColor(color) {
    try {
        const section = await sectionModel.find({color: color}, {name: 1});
        const sectionName = section[0].name;
        return sectionName;
    } catch(error) {
        console.error(error);
      }
}

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Mongoose connection is disconnected due to application termination');
        process.exit(0);
    } catch (error) {
        console.error(error);
    }
});