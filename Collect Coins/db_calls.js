import mongoose from 'mongoose';
let coinModel, activityModel, sectionModel, wishesModel, colorsModel, scoreModel;
let totalScore;

export async function initDatabaseAndSchemas() {
    try {
        await mongoose.connect("mongodb://localhost:27017/collectCoins");

        const coinSchema = new mongoose.Schema({
            color: {
                type: String,
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
                totalScore = await scoreModel.find();
                totalScore = totalScore[0];
                isFound = true;
            }
        }
       
        if (!isFound) {
            totalScore = new scoreModel({
                price:[],
            });

            await totalScore.save();
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
        await sectionModel.deleteOne({_id: sectionId});
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


         for (let coin of totalScore.price) {
            if (coin.color === activity.activities[0].price[0].color) {
                needNewCoin = false;
                coin.value += activity.activities[0].price[0].value;
                await totalScore.save();
                console.log(totalScore);
            }
        }

        if (needNewCoin) {
            const newCoin = new coinModel({
                color: activity.activities[0].price[0].color,
                value: activity.activities[0].price[0].value,
                sectionName: activity.name,
            });
            totalScore.price.push(newCoin);
            await totalScore.save();
            console.log(totalScore);
        }
    } catch(error) {
        console.error(error);
    }
}

export async function getScoreWithoutColors() {
    try {
        let total = 0;
        for (let unit of totalScore.price) {
            total += unit.value;
        }
        return total;
    } catch (error) {
        console.error(error);
    }
}

export async function getScoreByColors() {
    try {
        return totalScore.price;
    } catch (error) {
        console.error(error);
    }
}

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
        const newWish = new wishesModel({
            name: dataFromUI.name,
            price: allCoins,
        })
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

export async function getAllColors() {
  try {
    return await colorsModel.find();
  } catch(error) {
    console.error(error);
  }
}

export async function addNewColor(color) {
    try {
        const newColor = new colorsModel({
            color: color,
        });
        console.log(newColor)
        await newColor.save();
    } catch(error) {
        console.error(error);
      }
}

export async function removeColor(sectionId) {
    try {
        const color = await sectionModel.find({_id: sectionId}, {color: 1});
        await colorsModel.deleteOne({_id: color._id})
    } catch(error) {
        console.error(error);
      }
}

export async function findSectionNameByColor(color) {
    try {
        const sectionName = await sectionModel.find({color: color}, {name: 1});
        console.log("sectionName", sectionName[0]);
        return sectionName[0].name;
    } catch(error) {
        console.error(error);
      }
}

process.on('SIGINT', async () => {
      await mongoose.connection.close(() => {
      console.log('Mongoose connection is disconnected due to application termination');
      process.exit(0);
    });
  });