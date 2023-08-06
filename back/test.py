import pandas as pd

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

    print('actual revenue week', counts)
    
    ratios = [round(x/potentialRevenue*100,2) for x in counts]
    return {'data': ratios, 'weekUpper':upperBound, 'weekLower': int(round(result['weeks'].min(),0))}


df = pd.read_csv('data/current/Ship1/Ship1.csv')
df.dropna(axis=0, how='any', inplace = True)
    #response_data = CMQID(df,id,cabin)
response_data = CMQID(df,'Ship1','internal_bow')
print('response_data',response_data)