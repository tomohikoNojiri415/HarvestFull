from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import scipy.stats as stats
import numpy as np
from math import ceil


app = Flask(__name__)
CORS(app)  # This will enable CORS for the entire app

########### helpers ##########
def listCurId():
    df = pd.read_csv('data/current/ticket_details_current.csv')
    return df['ID'].unique().tolist()

def listHistoricalId():
    df = pd.read_csv('data/historical/ticket_details_historical.csv')
    return df['ID'].unique().tolist()

def listTicketType(df,id):
    if id == 'historical':
        print('id',id,'data',df['ticket_type'].unique().tolist())
        return df['ticket_type'].unique().tolist()
    else:
        print('id',id,'data',df[df['ID'] == id]['ticket_type'].unique().tolist())
        return df[df['ID'] == id]['ticket_type'].unique().tolist()

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
    lowerBound[lowerBound < 0] = 0
    upperBound = sampleMean + margin_of_error
    upperBound[upperBound > 100] = 100
    return {'mean': sampleMean.tolist(), 'lower': lowerBound.tolist(), 'upper': upperBound.tolist()}

#generate CMQ score for specifc id
def CMQID(df, id, ticketType):
    #read ticket details depending if historical or current
    dfIn= pd.read_csv('data/historical/ticket_details_historical.csv')
    idIsHistorical = True
    if id not in dfIn['ID'].unique().tolist():
        idIsHistorical = False
        dfIn = pd.read_csv('data/current/ticket_details_current.csv')
    dfIn = dfIn[dfIn['ID'] == id].copy()
    if ticketType != 'All':
        dfIn = dfIn[dfIn['ticket_type'] == ticketType].copy()

    potentialRevenue = (dfIn['tickets_available'] * dfIn['RRP']).sum()
    print('potentialRevenue',potentialRevenue)

    #df2 = df[df['ID'] == id & df['ticketType'] == ticketType].copy()
    df2 = df[df['ID'] == id].copy()
    #print("############ df2 ########### \n",df2)
    if ticketType != 'All':
        df2 = df2[df2['ticket_type'] == ticketType].copy()
    df2['booking_date'] = pd.to_datetime(df2['booking_date'], format='%d/%m/%Y')
    df2['sail_date'] = pd.to_datetime(df2['sail_date'], format='%d/%m/%Y')
    #ceil round number closer to 0 i.e -9.8 -> -9
    df2['weeks'] = ((df2['booking_date'] - df2['sail_date']).dt.days / 7).astype(int)
    #print('weeks',df2['weeks'])
    result = df2[['purchased_price','weeks']].groupby('weeks').sum().reset_index()
    counts = []
    upperBound = 1
    #print('result ############## \n',result)
    print('max',result.weeks.min(), result.weeks.max())
    if not idIsHistorical:
        upperBound = int(round(result['weeks'].max(),0))
    for week in range(result['weeks'].min(), upperBound):
        if len(counts) == 0: 
            counts.append(result.loc[result['weeks'] == week, 'purchased_price'].values[0] if week in result['weeks'].values else 0)
        else:
            counts.append((result.loc[result['weeks'] == week, 'purchased_price'].values[0] + counts[-1]) if week in result['weeks'].values else counts[-1])
    
    ratios = [round(x/potentialRevenue*100,2) for x in counts]
    return {'data': ratios, 'weekUpper':upperBound, 'weekLower': int(round(result['weeks'].min(),0))}

    #return {'data': []}

def CMQHistorical(df,ticketType):
    if ticketType != 'All':
        df = df[df['ticket_type'] == ticketType].copy()
    lists = []
    max_length = 0
    for id in df['ID'].unique().tolist():
        lists.append(CMQID(df,id, ticketType).get('data'))
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
    lowerBound[lowerBound < 0] = 0
    upperBound = sampleMean + margin_of_error
    upperBound[upperBound > 100] = 100
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
    response_data = listCurId()
    return jsonify(data=response_data, message="message Success")

#response data: a list of CURRENT ship id
@app.route('/tickettypelist/<id>', methods=['GET'])
def get_tickettypelist(id):
    response_data = listTicketType(pd.read_csv('data/current/ticket_details_current.csv'),id)
    return jsonify(data=response_data, message="message Success")

#CMQ -historical
@app.route('/cmq/<ticketType>', methods=['GET'])
def get_historical_cmq(ticketType):
    print('cmq', ticketType)
    df = pd.read_csv('data/historical/Historical_Cruises.csv')
    df.dropna(axis=0, how='any', inplace = True)
    response_data = CMQHistorical(df,ticketType)
    return jsonify(data=response_data, message="message Success")

#CMQ with specific ship
@app.route('/cmq/<id>/<ticketType>', methods=['GET'])
def get_cmq_spec(id,ticketType):
    print('cmqid', id, ticketType)
    df = pd.read_csv('data/current/'+id+'/'+id+'.csv')
    df.dropna(axis=0, how='any', inplace = True)
    #response_data = CMQID(df,id,cabin)
    response_data = CMQID(df,id,ticketType)
    print(response_data)
    return jsonify(data=response_data, message="message Success")

if __name__ == '__main__':
    app.run(debug=True)