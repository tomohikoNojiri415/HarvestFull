from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import scipy.stats as stats
import numpy as np


app = Flask(__name__)
CORS(app)  # This will enable CORS for the entire app

########### helpers ##########
def listId(df):
    return df['ID'].unique().tolist()

def listCabin(df,id):
    if id == 'historical':
        print('id',id,'data',df['TicketType'].unique().tolist())
        return df['TicketType'].unique().tolist()
    else:
        print('id',id,'data',df[df['ID'] == id]['TicketType'].unique().tolist())
        return df[df['ID'] == id]['TicketType'].unique().tolist()

def listCumBooking(df,id):
    capacity =  df['capacity'][0]
    df2 = df[df['ID'] == id].copy()
    df2['booking_date'] = pd.to_datetime(df['booking_date'], format='%d/%m/%Y')
    df2['sail_date'] = pd.to_datetime(df2['sail_date'], format='%d/%m/%Y')
    df2['weeks'] = ((df2['booking_date'] - df2['sail_date']).dt.days / 7).astype(int)
    result = df2.groupby('weeks').size().reset_index(name='count')
    counts = []
    for week in range(result['weeks'].min(), 1):
        if len(counts) == 0:
            counts.append(result.loc[result['weeks'] == week, 'count'].values[0] if week in result['weeks'].values else 0)
        else:
            counts.append((result.loc[result['weeks'] == week, 'count'].values[0] + counts[-1]) if week in result['weeks'].values else counts[-1])
    counts = [round(x/capacity*100,2) for x in counts]
    return counts

def listHistoricalBooking(df):
    lists = []
    max_length = 0
    for id in df['ID'].unique().tolist():
        lists.append(listCumBooking(df,id))
        if len(lists[-1]) > max_length:
            max_length = len(lists[-1])

    for idx, list in enumerate(lists):
        if len(list) < max_length:
            lists[idx] = [0]*(max_length-len(list))+list

    data = np.array(lists)
    # Calculate the mean and standard error of the mean (SEM)
    sampleMean = np.mean(data, axis=0)
    SE = stats.sem(data, axis=0)
    # Set the desired confidence level
    confidenceLvl = 0.95
    # Calculate the critical value (t) based on the confidence level and sample size
    sampleSize = len(data)
    criticalValue = stats.t.ppf(1 - (1 - confidenceLvl) / 2, sampleSize - 1)
    # margin
    margin_of_error = criticalValue * SE
    # Calculate the lower and upper bound values for each entry
    lowerBound = sampleMean - margin_of_error
    upperBound = sampleMean + margin_of_error
    return {'mean': sampleMean.tolist(), 'lower': lowerBound.tolist(), 'upper': upperBound.tolist()}

#generate CMQ score for specifc id
def CMQID(df, id):
    df2 = df[df['ID'] == id].copy()
    df2['booking_date'] = pd.to_datetime(df2['booking_date'], format='%d/%m/%Y')
    df2['sail_date'] = pd.to_datetime(df2['sail_date'], format='%d/%m/%Y')
    df2['weeks'] = ((df2['booking_date'] - df2['sail_date']).dt.days / 7).astype(int)
    result = df2[['purchased_price','weeks']].groupby('weeks').sum().reset_index()
    counts = []
    for week in range(result['weeks'].min(), 1):
        if len(counts) == 0:
            counts.append(result.loc[result['weeks'] == week, 'purchased_price'].values[0] if week in result['weeks'].values else 0)
        else:
            counts.append((result.loc[result['weeks'] == week, 'purchased_price'].values[0] + counts[-1]) if week in result['weeks'].values else counts[-1])
    
    dfIn = pd.read_csv('data/current/cabin_details_current.csv')
    potentialRevenue = (dfIn['TicketsAvailable'] * dfIn['RRP']).sum()
    ratios = [round(x/potentialRevenue*100,2) for x in counts]
    return ratios

def CMQ(df):
    lists = []
    max_length = 0
    for id in df['ID'].unique().tolist():
        lists.append(CMQID(df,id))
        if len(lists[-1]) > max_length:
            max_length = len(lists[-1])

    for idx, list in enumerate(lists):
        if len(list) < max_length:
            lists[idx] = [0]*(max_length-len(list))+list

    data = np.array(lists)
    # Calculate the mean and standard error of the mean (SEM)
    sampleMean = np.mean(data, axis=0)
    SE = stats.sem(data, axis=0)
    # Set the desired confidence level
    confidenceLvl = 0.95
    # Calculate the critical value (t) based on the confidence level and sample size
    sampleSize = len(data)
    criticalValue = stats.t.ppf(1 - (1 - confidenceLvl) / 2, sampleSize - 1)
    # margin
    margin_of_error = criticalValue * SE
    # Calculate the lower and upper bound values for each entry
    lowerBound = sampleMean - margin_of_error
    upperBound = sampleMean + margin_of_error
    return {'mean': sampleMean.tolist(), 'lower': lowerBound.tolist(), 'upper': upperBound.tolist()}

#chisquare test

#create session that stores company name involved
#route with 



############### routes(function with decorators) ###############

#test route
@app.route('/', methods=['GET'])
def receive_data():
    response_data = [{'id': 0, 'accumulative_booking': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}]
    return jsonify(data=response_data, message="message Success")

#booking curve 
#reponse data: json object of mean, upper bound and lower bound for accumulative booking 
#              {mean:[], upper:[], lower:[]}
@app.route('/booking/', methods=['GET'])
def get_booking_history():
    #read file and drop rows with missing values
    df = pd.read_csv('data/historical/Historical_Cruises.csv')
    df.dropna(axis=0, how='any', inplace = True)
    response_data = listHistoricalBooking(df)
    return jsonify(data=response_data, message="message Success")

# booking with specific ship
# response data: a list of accumulative booking for each week
@app.route('/booking/<id>', methods=['GET'])
def get_booking_spec(id):
    #read file and drop rows with missing values
    df = pd.read_csv('data/historical/Historical_Cruises.csv')
    df.dropna(axis=0, how='any', inplace = True)
    response_data = listCumBooking(df,id)
    return jsonify(data=response_data, message="message Success")

#response data: a list of CURRENT ship id
@app.route('/idlist', methods=['GET'])
def get_idlist():
    response_data = listId(pd.read_csv('data/current/cabin_details_current.csv'))
    return jsonify(data=response_data, message="message Success")

#response data: a list of CURRENT ship id
@app.route('/cabinlist/<id>', methods=['GET'])
def get_cabinlist(id):
    response_data = listCabin(pd.read_csv('data/current/cabin_details_current.csv'),id)
    return jsonify(data=response_data, message="message Success")

#CMQ -historical
@app.route('/cmq/<cabin>', methods=['GET'])
def get_historical_cmq(cabin):
    df = pd.read_csv('data/historical/Historical_Cruises.csv')
    df.dropna(axis=0, how='any', inplace = True)
    response_data = {}
    if cabin == 'all':
        response_data = CMQ(df)
    else:
        response_data = CMQ(df[df['cabin']==cabin])
    return jsonify(data=response_data, message="message Success")

#CMQ with specific ship
@app.route('/cmq/<id>/<cabin>', methods=['GET'])
def get_cmq_spec(id,cabin):
    df = pd.read_csv('data/historical/Historical_Cruises.csv')
    df.dropna(axis=0, how='any', inplace = True)
    response_data = {}
    if cabin == 'all':
        response_data = CMQID(df,id)
    else:
        response_data = CMQID(df[df['cabin']==cabin],id)
    return jsonify(data=response_data, message="message Success")

if __name__ == '__main__':
    app.run(debug=True)