import pandas as pd

def profile(id,week,variable):
    df = pd.read_csv('data/current/'+id+'/'+id+'.csv')
    df= df.dropna(axis=0, how='any')
    df = df[df['ID'] == id].copy()
    if week != 'all':
        df['booking_date'] = pd.to_datetime(df['booking_date'], format='%d/%m/%Y')
        df['sail_date'] = pd.to_datetime(df['sail_date'], format='%d/%m/%Y')
        df['weeks'] = ((df['booking_date'] - df['sail_date']).dt.days / 7).astype(int)
        df = df[df['weeks'] == week].copy()
    dtype = df[variable].dtype
    print(df[variable])
    #check if dataframe column is categorical or continuous
    if dtype == 'float64' or dtype == 'int64':
        dtype = 'continuous'
    else:
        dtype = 'categorical'
    unique_values_list = df[variable].unique().tolist()
    value_counts_list = df[variable].value_counts().tolist()

    #return a count and a list of unique values for categorical variables
    return {'dtype': dtype,  'x':unique_values_list,'y':value_counts_list}
print(profile('Ship1','all','gender'))