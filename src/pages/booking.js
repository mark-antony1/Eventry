import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import moment from 'moment-timezone';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { StatefulCalendar } from 'baseui/datepicker';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import {
  Display4,
  Label1,
} from 'baseui/typography';
import {
  useQuery,
  useMutation
} from '@apollo/react-hooks';
import {
  LOAD_BOOKING_FORM,
  GET_USER_BY_AUTH
} from '../constants/query';
import {
  BOOK_EVENT
} from '../constants/mutation';
import {
  venues
} from '../constants/locations';
import Loading from '../components/loading';
import HeaderNavigation from '../components/header-navigation';

const STEPS = {
  DATE: 'Date',
  DETAILS: 'Details'
};

function getHourMinute(hour, minute){
    const minuteString = !minute ? '00' : String(minute);
    if (hour === 12) {
      return `12 : ${minuteString} PM`;
    }
    if (hour === 24) {
      return `12 : ${minuteString} AM`;
    }
    if (hour > 12) {
      return `${hour - 12} : ${minuteString} PM`;
    }
    return `${hour} : ${minuteString} AM`;
}

function DateForm({ setCurrentStep, form, updateForm }) {
  const params = useParams();

  const {
    data: {
      getBusinessHours: businessHours
    }
  } = useQuery(LOAD_BOOKING_FORM, {
    variables: {
      symbol: params.venueSymbol
    }
  });

  const hours = businessHours.filter(h => h.day === form.day).sort((a, b) => a.open - b.open);

  const renderHours = () => {
    const timeBlocks = [];
    hours.forEach(h => {
      for (let i = h.open; i < (h.close - 1); i++) {
        timeBlocks.push({
          hour: i,
          minute: 0
        });
        timeBlocks.push({
          hour: i,
          minute: 30
        });
      }
    });

    return timeBlocks.map((b, index) => {
      return (
        <Button
          key={index}
          kind={
            (form.hour === b.hour && form.minute === b.minute) ?
            'primary' : 'minimal'
          }
          onClick={() => {
            updateForm({
              hour: b.hour,
              minute: b.minute
            });
          }}
        >
          <b>{getHourMinute(b.hour, b.minute)}</b>
        </Button>
      );
    });
  };

  return (
    <Block padding="48px" display="flex" justifyContent="center">
      <Block display="flex" flexDirection="column" justifyContent="center">
        <Display4 marginBottom="12px"><b>Select Date</b></Display4>
        <StatefulCalendar
          initialState={{value: form.date}}
          filterDate={(date) => {
            if (moment(date).isAfter(moment())) {
              return true;
            }
            return false;
          }}
          onChange={({date}) => {
            updateForm({
              date,
              day: moment(date).day(),
              hour: -1,
              minute: -1
            });
          }}
        />
      </Block>
      {
        hours.length ?
        <Block
          display="flex"
          flexDirection="column"
          marginLeft="24px"
        >
          <Display4 marginBottom="12px"><b>Select Time</b></Display4>
          <Block
            display="flex"
            flexDirection="column"
            height="330px"
            paddingLeft="12px"
            paddingRight="12px"
            overrides={{
              Block: {
                style: {
                  overflow: 'auto'
                }
              }
            }}
          >
            {renderHours()}
          </Block>
        </Block>
        :
        null
      }
      <Block display="flex" alignItems="center" margin="48px">
        <Button
          disabled={form.day === -1 || form.hour === -1}
          onClick={() => setCurrentStep(STEPS.DETAILS)}
        >
          Next <ChevronRight />
        </Button>
      </Block>
    </Block>
  );
}

function DetailsForm({ setCurrentStep, form, updateForm, handleBookEvent }) {
  const {
    data: {
      getUserByAuth: {
        user
      }
    }
  } = useQuery(GET_USER_BY_AUTH);

  const validateForm = () => {
    if (isNaN(form.groupSize) || !Number.isInteger(Number(form.groupSize))) {
      return false;
    }
    if (!form.masterPhoneNumber) {
      return false;
    }
    return true;
  };

  return (
    <Block padding="48px" display="flex" justifyContent="center">
      <Block display="flex" alignItems="center" margin="48px">
        <Button
          onClick={() => setCurrentStep(STEPS.DATE)}
        >
          <ChevronLeft /> Prev
        </Button>
      </Block>
      <Block display="flex" flexDirection="column">
        <Display4 marginBottom="12px"><b>Details</b></Display4>
        <FormControl label="Booker" error={null} positive="">
          <Label1>{user.firstName} {user.lastName}</Label1>
        </FormControl>
        <FormControl label="Group Size" error={null} positive="">
          <Input
            value={form.groupSize}
            type="number"
            placeholder="group size"
            onChange={e => {
              updateForm({
                groupSize: e.currentTarget.value
              });
            }}
          />
        </FormControl>
        <FormControl label="Note" error={null} positive="">
          <Textarea
            value={form.note}
            type="text"
            placeholder="note..."
            onChange={e => {
              updateForm({
                note: e.currentTarget.value
              });
            }}
          />
        </FormControl>
        <FormControl label="Contact Email" error={null} positive="">
          <Label1>{user.email}</Label1>
        </FormControl>
        <FormControl label="Contact Phone" error={null} positive="">
          <Input
            value={form.masterPhoneNumber}
            type="text"
            placeholder="phone number"
            onChange={e => {
              updateForm({
                masterPhoneNumber: e.currentTarget.value
              });
            }}
          />
        </FormControl>
      </Block>
      <Block display="flex" alignItems="center" margin="48px">
        <Button
          disabled={!validateForm()}
          onClick={handleBookEvent}
        >
          Book <ChevronRight />
        </Button>
      </Block>
    </Block>
  );
}

function BookingForm() {
  const history = useHistory();
  const params = useParams();
  const { venueSymbol: symbol } = params;
  const [ currentStep, setCurrentStep ] = useState(STEPS.DATE);
  const [ form, setForm ] = useState({
    date: null,
    day: -1,
    hour: -1,
    minute: -1,
    groupSize: '',
    note: '',
    masterPhoneNumber: ''
  });
  const [ bookEvent ] = useMutation(BOOK_EVENT);
  const { data, loading, error } = useQuery(LOAD_BOOKING_FORM, {
    variables: {
      symbol: symbol
    }
  });
  const { data: authData, loading: authLoading } = useQuery(GET_USER_BY_AUTH);


  const updateForm = (field) => {
    setForm({
      ...form,
      ...field
    });
  };

  const handleBookEvent = async () => {
    const time = moment(form.date);
    time.set({hour:form.hour,minute:form.minute,second:0,millisecond:0});
    const bookEventResponse = await bookEvent({
      variables: {
        time: time.toISOString(),
        groupSize: Number(form.groupSize),
        note: form.note,
        masterPhoneNumber: form.masterPhoneNumber
      }
    })
  };

  if (loading || authLoading || error) {
    return <Loading />;
  }

  const {
    getBusinessHours: businessHours
  } = data;

  const {
    getUserByAuth: auth
  } = authData;

  const venue = venues.find((v) => v.symbol === symbol);

  if (!businessHours || !venue) {
    return (
      <Block>
        Booking is not available for this venue yet
      </Block>
    );
  }

  return (
    <Block display="flex" flexDirection="column" paddingLeft="48px" paddingRight="48px" paddingTop="24px" paddingBottom="24px">
      <Block marginLeft="12px" marginRight="12px">
        <Label1><b>{venue.teaserDescription}</b></Label1>
        <Display4><b>{venue.name}</b></Display4>
      </Block>
      {
        !auth &&
        <Block display="flex" flexDirection="column" alignItems="center" margin="24px">
          <Label1><b>Join TeamBright and get access to the full booking experiences</b></Label1>
          <Block margin="24px">
            <Button
              onClick={() => {
                history.push(`/user/?from=${symbol}/booking`);
              }}
            >Sign up for TeamBright</Button>
          </Block>
        </Block>
      }
      {
        auth &&
        <Block>
          {
            currentStep === STEPS.DATE &&
            <DateForm
              setCurrentStep={setCurrentStep}
              form={form}
              updateForm={updateForm}
            />
          }
          {
            currentStep === STEPS.DETAILS &&
            <DetailsForm
              setCurrentStep={setCurrentStep}
              form={form}
              updateForm={updateForm}
              handleBookEvent={handleBookEvent}
            />
          }
        </Block>
      }
      {
        auth &&
        <Block display="flex" justifyContent="center">
          <Button
            kind="minimal"
            onClick={() => setCurrentStep(STEPS.DATE)}
          >
            <Display4 color={currentStep === STEPS.DATE ? '#000' : '#727272'}><b>{STEPS.DATE}</b></Display4>
          </Button>
          <Button
            kind="minimal"
            onClick={() => setCurrentStep(STEPS.DETAILS)}
            disabled={form.day === -1 || form.hour === -1}
          >
            <Display4 color={currentStep === STEPS.DETAILS ? '#000' : '#727272'}><b>{STEPS.DETAILS}</b></Display4>
          </Button>
        </Block>
      }
    </Block>
  );
}

export default function Booking() {
  return (
    <Block display="flex" flexDirection="column" height="100vh">
      <HeaderNavigation leftButtons={[]} />
      <Block>
        <BookingForm />
      </Block>
    </Block>
  );
}
