from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

import os
import uuid

from flask import session

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

class GoogleMeetSystem:
    def __init__(self, client_secrets_file, redirect_uri,scopes):
        self.client_secrets_file = client_secrets_file
        self.redirect_uri = redirect_uri
        self.scopes = scopes

    def authorize(self):
        flow = Flow.from_client_secrets_file(
            self.client_secrets_file,
            scopes=self.scopes,
            redirect_uri=self.redirect_uri
        )
        auth_url, state = flow.authorization_url(access_type='offline')
        session['state'] = state
        return auth_url
    
    def get_user_info(self, credentials):
        try:
            service = build('people', 'v1', credentials=credentials)
            profile = service.people().get(
                resourceName='people/me',
                personFields='emailAddresses,names'
            ).execute()

            email = profile['emailAddresses'][0]['value'] if 'emailAddresses' in profile else None
            name = profile['names'][0]['displayName'] if 'names' in profile else None

            return {'email':email, 'name':name}
        except Exception as e:
            raise Exception(f"Error fetching user info: {str(e)}")
    
    def handle_oauth_callback(self, authorization_response, state):
        flow = Flow.from_client_secrets_file(
            self.client_secrets_file,
            scopes=self.scopes,
            state=state,
            redirect_uri=self.redirect_uri
        )
        flow.fetch_token(authorization_response=authorization_response)
        credentials = flow.credentials
        session['credentials'] = self._credentials_to_dict(credentials)
        return credentials
    
    def create_class(self, credentials, title, description, start_time, end_time, time_zone):
        """
        Create a Google Meet meeting.
        :param credentials: OAuth2 credentials for the user.
        :param title: Title of the class.
        :param description: Description of the class.
        :param start_time: Start time in RFC3339 format.
        :param end_time: End time in RFC3339 format.
        :param time_zone: Time zone of the class.
        :return: Meeting link and event details.
        """
        try:
            service = build("calendar", "v3", credentials=credentials)
            event = {
                'summary':title,
                'description':description,
                'start': {'dateTime': start_time, 'timeZone':time_zone},
                'end':{'dateTime': end_time, 'timeZone':time_zone},
                'conferenceData': {'createRequest':{'requestId':str(uuid.uuid4())}}
            }
            
            event_result = service.events().insert(
                calendarId="primary", body=event, conferenceDataVersion=1
            ).execute()

            meeting_link = event_result['conferenceData']['entryPoints'][0]['uri']
            return {'meeting_link':meeting_link, 'event_details':event_result}
        
        except Exception as e:
            raise Exception(f'Error creating meeting {str(e)}')
    
    @staticmethod
    def _credentials_to_dict(credentials):
        return {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes,
        }