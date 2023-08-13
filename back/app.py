from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import scipy.stats as stats
import numpy as np


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
        #print('id',id,'data',df['ticket_type'].unique().tolist())
        return df['ticket_type'].unique().tolist()
    else:
        df = pd.read_csv('data/current/ticket_details_current.csv')
        #print('id',id,'data',df[df['ID'] == id]['ticket_type'].unique().tolist())
        return df[df['ID'] == id]['ticket_type'].unique().tolist()

def listCumBooking(df,id):
    dfIn= pd.read_csv('data/historical/ticket_details_historical.csv')
    #print(dfIn['ID'].unique().tolist())
    idIsHistorical = True
    if id not in dfIn['ID'].unique().tolist():
        idIsHistorical = False
        df= pd.read_csv('data/current/'+id+'/'+id+'.csv')
    #print(id,'idIsHistorical',idIsHistorical)
    df = df[df['ID'] == id].copy()
    capacity = df['capacity'].values[0]
    df['booking_date'] = pd.to_datetime(df['booking_date'], format='%d/%m/%Y')
    df['sail_date'] = pd.to_datetime(df['sail_date'], format='%d/%m/%Y')
    df['weeks'] = ((df['booking_date'] - df['sail_date']).dt.days / 7).astype(int)
    result = df.groupby('weeks').size().reset_index(name='count')
    #print('result',result)
    counts = []
    upperBound = 1
    #print('result ############## \n',result)
    #print('flag',idIsHistorical)
    #print('max',result.weeks.min(), result.weeks.max())
    if not idIsHistorical:
        upperBound = int(round(result['weeks'].max(),0))

    for week in range(result['weeks'].min(), upperBound):
        if len(counts) == 0:
            counts.append(result.loc[result['weeks'] == week, 'count'].values[0] if week in result['weeks'].values else 0)
        else:
            counts.append((result.loc[result['weeks'] == week, 'count'].values[0] + counts[-1]) if week in result['weeks'].values else counts[-1])
    counts = [round(x/capacity*100,2) for x in counts]
    #print('counts',counts)
    return {'data': counts, 'weekUpper':upperBound, 'weekLower': int(round(result['weeks'].min(),0))}


def listHistoricalBooking(df):
    lists = []
    max_length = 0
    for id in df['ID'].unique().tolist():
        lists.append(listCumBooking(df,id).get('data'))
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
def CMQID(id, ticketType):
    #read ticket details depending if historical or current
    dfIn= pd.read_csv('data/historical/ticket_details_historical.csv')
    df = pd.read_csv('data/historical/Historical_Cruises.csv')
    idIsHistorical = True
    if id not in dfIn['ID'].unique().tolist():
        idIsHistorical = False
        dfIn = pd.read_csv('data/current/ticket_details_current.csv')
        df = pd.read_csv('data/current/'+id+'/'+id+'.csv')
    dfIn = dfIn[dfIn['ID'] == id].copy()
    if ticketType != 'All':
        dfIn = dfIn[dfIn['ticket_type'] == ticketType].copy()
    potentialRevenue = (dfIn['tickets_available'] * dfIn['RRP']).sum()
    #print('potentialRevenue',potentialRevenue)

    df = df.dropna(axis=0, how='any')
    #df = pd.read_csv('data/current/'+id+'/'+id+'.csv')
    #df2 = df[df['ID'] == id & df['ticketType'] == ticketType].copy()
    #print("############ df2 ########### \n",df2)
    df['booking_date'] = pd.to_datetime(df['booking_date'], format='%d/%m/%Y')
    df['sail_date'] = pd.to_datetime(df['sail_date'], format='%d/%m/%Y')
    #ceil round number closer to 0 i.e -9.8 -> -9
    df['weeks'] = ((df['booking_date'] - df['sail_date']).dt.days / 7).astype(int)
    minWeek = df['weeks'].min()
    maxWeek = df['weeks'].max()
    df2 = df[df['ID'] == id].copy()
    #print('weeks',df2['weeks'])
    if ticketType != 'All':
        df2 = df2[df2['ticket_type'] == ticketType].copy()
    result = df2[['purchased_price','weeks']].groupby('weeks').sum().reset_index()
    # if idIsHistorical == False:
    #     print('id',id,'minmax', minWeek, maxWeek,'result',result)
    #     print('result min max', result['weeks'].min(), result['weeks'].max())
    counts = []
    upperBound = 1
    lowerBound = minWeek
    #lowerBound = int(result['weeks'].min())
    #print('result ############## \n',result)
    #print('max',result.weeks.min(), result.weeks.max())
    if not idIsHistorical:
        upperBound = int(result['weeks'].max())
    for week in range(lowerBound, upperBound):
        if len(counts) == 0: 
            counts.append(result.loc[result['weeks'] == week, 'purchased_price'].values[0] if week in result['weeks'].values else 0)
        else:
            counts.append((result.loc[result['weeks'] == week, 'purchased_price'].values[0] + counts[-1]) if week in result['weeks'].values else counts[-1])
    
    ratios = [round(x/potentialRevenue*100,2) for x in counts]
    #append lowerBound - minWeek number of 0s to the front of the list
    ratios = [0]*(lowerBound-minWeek)+ratios
    #append 0 - maxWeek number of the last elementof list to the end of the list
    ratios = ratios + [ratios[-1]]*(maxWeek-upperBound)
    return {'data': ratios, 'weekUpper':upperBound -1, 'weekLower': int(round(result['weeks'].min(),0))}

    #return {'data': []}

def CMQHistorical(df,ticketType):
    if ticketType != 'All':
        df = df[df['ticket_type'] == ticketType].copy()
    lists = []
    minLower = 1
    maxUpper = -999
    for id in df['ID'].unique().tolist():
        res = CMQID(id,ticketType)
        lists.append(res)
        if res.get('weekLower') < minLower:
            minLower = res.get('weekLower')
        if res.get('weekUpper') > maxUpper:
            maxUpper = res.get('weekUpper')

    result_list = []
    maxLen = -1
    for list in lists:
        result_list.append(list.get('data'))
    data = np.array(result_list)
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

def profileVariables(id):
    df = pd.read_csv('data/historical/Historical_Cruises.csv')
    if id != 'historical':
        df = pd.read_csv('data/current/'+id+'/'+id+'.csv')
    #df= df.dropna(axis=0, how='any')
    df = df[df['ID'] == id].copy()
    cols = df.columns.tolist()
    critical_cols = ['booking_date','sail_date','ID','ticket_type','purchased_price','capacity','RRP']
    for col in critical_cols:
        cols.remove(col)
    return cols

#historical
#return a list of weeks of current ships
def ID2WeekList(id):
    df = pd.read_csv('data/historical/Historical_Cruises.csv')
    if id != 'historical':
        df = pd.read_csv('data/current/'+id+'/'+id+'.csv')
    df= df.dropna(axis=0, how='any')
    df['booking_date'] = pd.to_datetime(df['booking_date'], format='%d/%m/%Y')
    df['sail_date'] = pd.to_datetime(df['sail_date'], format='%d/%m/%Y')
    df['weeks'] = ((df['booking_date'] - df['sail_date']).dt.days / 7).astype(int)
    return df['weeks'].unique().tolist()


def profile(id,week,variable):
    #print('input',id,week,variable) 
    df = pd.read_csv('data/historical/Historical_Cruises.csv')
    if id != 'historical':
        df = pd.read_csv('data/current/'+id+'/'+id+'.csv')
    df= df.dropna(axis=0, how='any')
    if week != 'All':
        df['booking_date'] = pd.to_datetime(df['booking_date'], format='%d/%m/%Y')
        df['sail_date'] = pd.to_datetime(df['sail_date'], format='%d/%m/%Y')
        df['weeks'] = ((df['booking_date'] - df['sail_date']).dt.days / 7).astype(int)
        df = df[df['weeks'] == int(week)].copy()
    dtype = df[variable].dtype
    chartType = 'line'
    x_values = df[variable].unique().tolist()
    y_values = df[variable].value_counts().tolist()
    data = [{'x': x, 'y': y} for x, y in zip(x_values, y_values)]
    data = sorted(data, key=lambda k: k['x'])
    #check if dataframe column is categorical or continuous
    if dtype == 'float64' or dtype == 'int64':
        chartType = 'line'
    else:
        chartType = 'bar'
    #return a count and a list of unique values for categorical variables
    return {'ctype': chartType,  'data':data}



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
    df = pd.read_csv('data/historical/Historical_Cruises.csv')
    df.dropna(axis=0, how='any', inplace = True)
    response_data = CMQHistorical(df,ticketType)
    return jsonify(data=response_data, message="message Success")

#CMQ with specific ship
@app.route('/cmq/<id>/<ticketType>', methods=['GET'])
def get_cmq_spec(id,ticketType):
    dfHistory = pd.read_csv('data/historical/Historical_Cruises.csv')
    dfHistory.dropna(axis=0, how='any', inplace = True)
    shipData = CMQID(id,ticketType)
    historicalData = CMQHistorical(dfHistory,ticketType)
    print('history length', len(historicalData.get('mean')))
    return jsonify(data= {'cur':shipData,'his':historicalData}, message="message Success")

#profile
@app.route('/profile/<id>/<week>/<variable>', methods=['GET'])
def get_profile(id,week,variable):
    #print('get_profile',id,week,variable)
    response_data = {'ctype': 'line', 'data': [{'x': 0, 'y': 0}]}
    if variable != '(variable)':
        response_data = profile(id,week,variable)
    print('profile',response_data)
    return jsonify(data=response_data, message="message Success")

#profileweeks
@app.route('/profileweeks/<id>', methods=['GET'])
def get_profile_weeks(id):
    #print('profile weeks',id)
    response_data = ID2WeekList(id)
    #print(response_data)
    return jsonify(data=response_data, message="message Success")

#profile
@app.route('/profilevariables/<id>', methods=['GET'])
def get_profilevariables(id):
    response_data = profileVariables(id)
   #print('profilevariables',response_data)
    return jsonify(data=response_data, message="message Success")
if __name__ == '__main__':
    app.run(debug=True)