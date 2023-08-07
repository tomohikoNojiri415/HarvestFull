import pandas as pd
import numpy as np
import scipy.stats as stats

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
    print('minmax',minWeek, maxWeek)
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
    print('upperBound',upperBound,'lowerBound',lowerBound)
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
    print('ratios',ratios,len(ratios))
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

id = 'Ship3'
dfHistory = pd.read_csv('data/historical/Historical_Cruises.csv')
dfHistory.dropna(axis=0, how='any', inplace = True)
#shipData = CMQID(df,id,'Suites_Mid')
historicalData = CMQHistorical(dfHistory,'Suites_Mid')
print('history length', len(historicalData.get('mean')))
print(historicalData.get('mean'))